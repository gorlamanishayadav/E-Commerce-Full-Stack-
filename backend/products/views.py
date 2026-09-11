from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Category, Product, ProductImage, Review, Wishlist
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    ProductImageSerializer,
    ReviewSerializer,
    WishlistSerializer
)
from accounts.permissions import (
    IsAdminUserRole,
    IsSellerUserRole,
    IsSellerOrReadOnly,
    IsProductOwnerOrAdmin,
    IsOwnerOrAdmin
)

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    category_slug = django_filters.CharFilter(field_name="category__slug", lookup_expr='exact')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')

    class Meta:
        model = Product
        fields = ['category', 'category_slug', 'is_active', 'min_price', 'max_price']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)

class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD for product categories.
    Read-only for public, Full CRUD for Admin.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUserRole()]

class ProductViewSet(viewsets.ModelViewSet):
    """
    Product management with Role-Based Access:
    - Public: list & retrieve active products
    - Seller / Admin: create products
    - Product Owner / Admin: update, delete products, upload images
    - Seller: retrieve list of own products
    """
    queryset = Product.objects.all().select_related('category', 'seller').prefetch_related('images', 'reviews')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'description', 'category__name']
    ordering_fields = ['price', 'created_at', 'stock']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        # Admins and product-owning sellers can see inactive products in specific views
        if self.action in ['my_products']:
            return Product.objects.filter(seller=user).select_related('category', 'seller').prefetch_related('images', 'reviews')
        if user.is_authenticated and (user.role == 'ADMIN' or user.is_superuser):
            return Product.objects.all().select_related('category', 'seller').prefetch_related('images', 'reviews')
        return Product.objects.filter(is_active=True).select_related('category', 'seller').prefetch_related('images', 'reviews')

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action in ['retrieve']:
            return ProductDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [IsSellerUserRole()]
        if self.action in ['update', 'partial_update', 'destroy', 'upload_image']:
            return [IsProductOwnerOrAdmin()]
        if self.action == 'my_products':
            return [IsSellerUserRole()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsSellerUserRole])
    def my_products(self, request):
        """
        Sellers retrieve all products they created (active and inactive).
        """
        products = Product.objects.filter(seller=request.user)
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsProductOwnerOrAdmin])
    def upload_image(self, request, slug=None):
        """
        Upload additional image for a specific product.
        """
        product = self.get_object()
        image = request.FILES.get('image')
        is_featured = request.data.get('is_featured', 'false').lower() in ('true', '1')
        if not image:
            return Response({'error': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if is_featured:
            product.images.update(is_featured=False)
            
        product_image = ProductImage.objects.create(
            product=product,
            image=image,
            is_featured=is_featured
        )
        return Response(ProductImageSerializer(product_image, context={'request': request}).data, status=status.HTTP_201_CREATED)

class ReviewViewSet(viewsets.ModelViewSet):
    """
    Product reviews:
    - Anyone: view reviews
    - Customer / Authenticated user: post review on product
    - Review author / Admin: update or delete review
    """
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'rating']
    ordering = ['-created_at']

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return Review.objects.filter(product_id=product_id).select_related('user')
        return Review.objects.all().select_related('user')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        # Check if already reviewed, update if so or create new
        existing_review = Review.objects.filter(product=product, user=self.request.user).first()
        if existing_review:
            existing_review.rating = serializer.validated_data['rating']
            existing_review.comment = serializer.validated_data['comment']
            existing_review.save()
            serializer.instance = existing_review
        else:
            serializer.save(user=self.request.user)

class WishlistViewSet(viewsets.ModelViewSet):
    """
    Wishlist management for authenticated users:
    - GET /api/products/wishlist/ : list wishlisted items
    - POST /api/products/wishlist/ : add product to wishlist
    - POST /api/products/wishlist/toggle/ : toggle product in/out of wishlist
    - DELETE /api/products/wishlist/{id}/ : remove item from wishlist (supports ID or product_id lookup)
    """
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Wishlist.objects.filter(
            user=self.request.user
        ).select_related('product', 'product__category', 'product__seller').prefetch_related('product__images', 'product__reviews')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        wishlist_item = Wishlist.objects.filter(user=request.user, product=product).first()
        if wishlist_item:
            wishlist_item.delete()
            return Response({
                'status': 'removed',
                'is_wishlisted': False,
                'product_id': product.id,
                'message': f'Removed {product.title} from wishlist.'
            }, status=status.HTTP_200_OK)
        else:
            item = Wishlist.objects.create(user=request.user, product=product)
            return Response({
                'status': 'added',
                'is_wishlisted': True,
                'product_id': product.id,
                'item': WishlistSerializer(item, context={'request': request}).data,
                'message': f'Added {product.title} to wishlist.'
            }, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        lookup_val = self.kwargs.get('pk')
        item = Wishlist.objects.filter(user=request.user, pk=lookup_val).first() or \
               Wishlist.objects.filter(user=request.user, product_id=lookup_val).first()
        if item:
            prod_id = item.product_id
            item.delete()
            return Response({
                'status': 'removed',
                'is_wishlisted': False,
                'product_id': prod_id
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Wishlist item not found.'}, status=status.HTTP_404_NOT_FOUND)

