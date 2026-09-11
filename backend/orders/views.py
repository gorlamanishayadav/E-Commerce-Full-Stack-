from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Cart, CartItem, Order, OrderItem, OrderStatus, PaymentStatus
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    OrderItemSerializer,
    OrderStatusUpdateSerializer
)
from accounts.permissions import (
    IsAdminUserRole,
    IsSellerUserRole,
    IsCustomerUserRole
)
from products.models import Product

class CartView(APIView):
    """
    Shopping Cart for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        """
        Add item to cart or update its quantity.
        Payload: { "product_id": 1, "quantity": 2 }
        """
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity <= 0:
            return Response({'error': 'quantity must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found or unavailable.'}, status=status.HTTP_404_NOT_FOUND)

        if product.stock < quantity:
            return Response({'error': f'Only {product.stock} items in stock.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
            
        if cart_item.quantity > product.stock:
            cart_item.quantity = product.stock

        cart_item.save()
        return Response(CartSerializer(cart, context={'request': request}).data, status=status.HTTP_200_OK)

    def delete(self, request):
        """
        Clear all items from the cart.
        """
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart emptied successfully.'}, status=status.HTTP_200_OK)

class CartItemDetailView(APIView):
    """
    Update quantity or remove a single item from the cart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        try:
            item = cart.items.get(id=item_id)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        quantity = request.data.get('quantity')
        if quantity is not None:
            quantity = int(quantity)
            if quantity <= 0:
                item.delete()
            else:
                if quantity > item.product.stock:
                    return Response({'error': f'Only {item.product.stock} items available.'}, status=status.HTTP_400_BAD_REQUEST)
                item.quantity = quantity
                item.save()

        return Response(CartSerializer(cart, context={'request': request}).data, status=status.HTTP_200_OK)

    def delete(self, request, item_id):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        try:
            item = cart.items.get(id=item_id)
            item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(CartSerializer(cart, context={'request': request}).data, status=status.HTTP_200_OK)

class OrderViewSet(viewsets.ModelViewSet):
    """
    Order Management with Role-Based Access:
    - Customer: Create order (checkout), list own orders, view own order
    - Seller: View sold items & orders containing their products
    - Admin: Full access to all orders and status updates
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    ordering_fields = ['created_at', 'total_amount']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN' or user.is_superuser:
            return Order.objects.all().prefetch_related('items')
        return Order.objects.filter(customer=user).prefetch_related('items')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsSellerUserRole])
    def seller_orders(self, request):
        """
        Sellers retrieve order items for their products.
        """
        sold_items = OrderItem.objects.filter(seller=request.user).select_related('order', 'product').order_by('-order__created_at')
        page = self.paginate_queryset(sold_items)
        if page is not None:
            serializer = OrderItemSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = OrderItemSerializer(sold_items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUserRole])
    def update_status(self, request, pk=None):
        """
        Admin updates order status (e.g. PROCESSING, SHIPPED, DELIVERED) or payment status.
        """
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(order, context={'request': request}).data)
