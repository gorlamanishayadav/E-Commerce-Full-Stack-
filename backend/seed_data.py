import os
import sys
import django

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Category, Product, ProductImage, Review
from orders.models import Cart

User = get_user_model()

def seed():
    print("🌱 Seeding database with initial data...")

    # 1. Create Superuser / Admin
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@ecommerce.com',
            'first_name': 'System',
            'last_name': 'Administrator',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('Admin@123456')
        admin_user.save()
        print(" -> Created Admin user: admin (Password: Admin@123456)")
    else:
        print(" -> Admin user already exists")

    # 2. Create Sellers
    seller_user, created = User.objects.get_or_create(
        username='seller_alex',
        defaults={
            'email': 'alex.seller@ecommerce.com',
            'first_name': 'Alex',
            'last_name': 'TechStore',
            'role': 'SELLER',
            'is_verified_seller': True,
            'phone_number': '+1 555-0199',
            'city': 'San Francisco',
            'country': 'USA'
        }
    )
    if created:
        seller_user.set_password('Seller@123456')
        seller_user.save()
        print(" -> Created Seller user: seller_alex (Password: Seller@123456)")
    else:
        print(" -> Seller user already exists")

    # 3. Create Customers
    customer_user, created = User.objects.get_or_create(
        username='customer_jane',
        defaults={
            'email': 'jane.customer@ecommerce.com',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'role': 'CUSTOMER',
            'phone_number': '+1 555-0144',
            'address': '742 Evergreen Terrace',
            'city': 'Springfield',
            'country': 'USA',
            'postal_code': '97477'
        }
    )
    if created:
        customer_user.set_password('Customer@123456')
        customer_user.save()
        print(" -> Created Customer user: customer_jane (Password: Customer@123456)")
    else:
        print(" -> Customer user already exists")

    # 4. Create Categories
    categories_data = [
        {'name': 'Electronics', 'description': 'Smartphones, laptops, audio, and high-tech gadgets.'},
        {'name': 'Fashion & Apparel', 'description': 'Modern clothing, shoes, and luxury accessories.'},
        {'name': 'Home & Living', 'description': 'Furniture, kitchenware, and modern home decor.'},
        {'name': 'Fitness & Sports', 'description': 'Gym equipment, outdoor gear, and apparel.'}
    ]

    category_objs = {}
    for cat_data in categories_data:
        cat, _ = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        category_objs[cat.name] = cat
    print(f" -> Populated {len(category_objs)} categories.")

    # 5. Create Sample Products with Images
    products_data = [
        {
            'title': 'AeroPro Wireless Noise Cancelling Headphones',
            'category': category_objs['Electronics'],
            'price': 249.99,
            'discount_price': 199.99,
            'stock': 35,
            'description': 'Experience studio-grade sound clarity with 40-hour battery life and adaptive hybrid noise cancellation.',
            'image': 'products/headphones.jpg'
        },
        {
            'title': 'Quantum Ultra 4K Smart OLED Monitor 32"',
            'category': category_objs['Electronics'],
            'price': 699.99,
            'discount_price': 649.99,
            'stock': 12,
            'description': 'Crisp 4K HDR resolution with 144Hz refresh rate, 1ms response time, and vibrant color accuracy for creators and gamers.',
            'image': 'products/monitor.jpg'
        },
        {
            'title': 'Minimalist Italian Leather Backpack',
            'category': category_objs['Fashion & Apparel'],
            'price': 149.00,
            'discount_price': 129.00,
            'stock': 20,
            'description': 'Handcrafted premium full-grain leather backpack with padded laptop sleeve and water-resistant finish.',
            'image': 'products/backpack.jpg'
        },
        {
            'title': 'Ergonomic Mesh Task Chair',
            'category': category_objs['Home & Living'],
            'price': 329.00,
            'discount_price': 289.00,
            'stock': 15,
            'description': 'Adjustable lumbar support, 3D armrests, and breathable high-density mesh for all-day comfort.',
            'image': 'products/chair.jpg'
        },
        {
            'title': "Seller's Wireless Keyboard",
            'category': category_objs['Electronics'],
            'price': 99.99,
            'discount_price': 79.99,
            'stock': 25,
            'description': 'Ultra-slim wireless mechanical keyboard with multi-device Bluetooth connectivity and RGB backlighting.',
            'image': 'products/keyboard.jpg'
        }
    ]

    for p_data in products_data:
        image_path = p_data.pop('image', None)
        prod, _ = Product.objects.get_or_create(
            title=p_data['title'],
            seller=seller_user,
            defaults={
                'category': p_data['category'],
                'price': p_data['price'],
                'discount_price': p_data['discount_price'],
                'stock': p_data['stock'],
                'description': p_data['description'],
                'is_active': True
            }
        )
        if image_path:
            ProductImage.objects.get_or_create(
                product=prod,
                image=image_path,
                defaults={'is_featured': True}
            )
            # Ensure is_featured is set
            prod.images.filter(image=image_path).update(is_featured=True)

    print(" -> Populated sample products with product images.")

    # 6. Create Sample Review
    first_product = Product.objects.first()
    if first_product:
        Review.objects.get_or_create(
            product=first_product,
            user=customer_user,
            defaults={
                'rating': 5,
                'comment': 'Outstanding audio quality and super comfortable for long working sessions!'
            }
        )
        print(" -> Populated sample review.")

    print("✨ Seeding completed successfully!")

if __name__ == '__main__':
    seed()
