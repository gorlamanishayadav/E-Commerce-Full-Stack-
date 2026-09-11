from rest_framework import serializers
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem
from products.models import Product
from products.serializers import ProductListSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source='product',
        write_only=True
    )
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'unit_price', 'subtotal', 'added_at']
        read_only_fields = ['id', 'unit_price', 'subtotal', 'added_at']

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items_count', 'updated_at']
        read_only_fields = ['id', 'total_price', 'total_items_count', 'updated_at']

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'seller', 'product_title', 'price', 'quantity', 'subtotal']
        read_only_fields = ['id', 'product', 'seller', 'product_title', 'price', 'quantity', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'customer_username', 'status',
            'payment_status', 'shipping_full_name', 'shipping_phone',
            'shipping_address', 'shipping_city', 'shipping_country',
            'shipping_postal_code', 'total_amount', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'customer', 'customer_username', 'total_amount', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id', 'shipping_full_name', 'shipping_phone',
            'shipping_address', 'shipping_city', 'shipping_country',
            'shipping_postal_code', 'order_number', 'total_amount',
            'created_at'
        ]
        read_only_fields = ['id', 'order_number', 'total_amount', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        cart = Cart.objects.filter(user=user).prefetch_related('items__product').first()

        if not cart or not cart.items.exists():
            raise serializers.ValidationError({"cart": "Your cart is empty."})

        with transaction.atomic():
            # Validate inventory before creating order
            total_amount = 0
            for item in cart.items.all():
                if item.product.stock < item.quantity:
                    raise serializers.ValidationError({
                        "stock": f"Insufficient stock for '{item.product.title}'. Only {item.product.stock} left."
                    })
                total_amount += item.subtotal

            # Create the order
            order = Order.objects.create(
                customer=user,
                total_amount=total_amount,
                **validated_data
            )

            # Create order items and decrement stock
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    seller=item.product.seller,
                    product_title=item.product.title,
                    price=item.unit_price,
                    quantity=item.quantity,
                    subtotal=item.subtotal
                )
                item.product.stock -= item.quantity
                item.product.save(update_fields=['stock'])

            # Clear cart
            cart.items.all().delete()

        return order

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status', 'payment_status']
