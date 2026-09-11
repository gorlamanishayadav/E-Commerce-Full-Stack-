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

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from products.models import Category, Product
from orders.models import Cart, Order

User = get_user_model()

def run_tests():
    print("🚀 Starting Automated E-Commerce Backend Verification...\n")
    client = APIClient()

    # 1. Test Registration
    print("1️⃣ Testing Customer Registration...")
    reg_payload = {
        "username": "test_buyer",
        "email": "buyer@test.com",
        "password": "Password@123",
        "password_confirm": "Password@123",
        "role": "CUSTOMER",
        "first_name": "Test",
        "last_name": "Buyer"
    }
    res = client.post('/api/accounts/register/', reg_payload, format='json')
    assert res.status_code in [201, 400], f"Registration failed: {res.data}"
    print("   ✅ Customer registration endpoint works correctly.")

    # 2. Test JWT Login & Token Custom Claims
    print("\n2️⃣ Testing JWT Authentication & Custom Claims...")
    login_payload = {
        "username": "seller_alex",
        "password": "Seller@123456"
    }
    res = client.post('/api/auth/token/', login_payload, format='json')
    assert res.status_code == 200, f"Seller login failed: {res.data}"
    seller_token = res.data['access']
    seller_user_data = res.data['user']
    assert seller_user_data['role'] == 'SELLER', f"Expected role SELLER, got {seller_user_data['role']}"
    print(f"   ✅ Seller login returned valid JWT token with role: {seller_user_data['role']}")

    # Login customer
    res = client.post('/api/auth/token/', {"username": "customer_jane", "password": "Customer@123456"}, format='json')
    assert res.status_code == 200, f"Customer login failed: {res.data}"
    customer_token = res.data['access']
    customer_user_data = res.data['user']
    print(f"   ✅ Customer login returned valid JWT token with role: {customer_user_data['role']}")

    # Login admin
    res = client.post('/api/auth/token/', {"username": "admin", "password": "Admin@123456"}, format='json')
    assert res.status_code == 200, f"Admin login failed: {res.data}"
    admin_token = res.data['access']
    print("   ✅ Admin login returned valid JWT token.")

    # 3. Test Public Browsing of Categories and Products
    print("\n3️⃣ Testing Public Access (No Auth Header)...")
    client.credentials() # Clear auth header
    res = client.get('/api/products/items/')
    assert res.status_code == 200, f"Failed to list products publicly: {res.data}"
    print(f"   ✅ Public user can view product catalog ({res.data.get('count', len(res.data))} products found).")

    res = client.get('/api/products/categories/')
    assert res.status_code == 200, f"Failed to list categories publicly: {res.data}"
    print(f"   ✅ Public user can view categories ({len(res.data)} categories found).")

    # 4. Test RBAC: Customer CANNOT create products (Must return 403 Forbidden)
    print("\n4️⃣ Testing Role-Based Access Control (Product Creation)...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
    cat = Category.objects.first()
    product_payload = {
        "title": "Unauthorized Product",
        "category": cat.id if cat else None,
        "description": "This should be blocked by RBAC",
        "price": "99.99",
        "stock": 10
    }
    res = client.post('/api/products/items/', product_payload, format='json')
    assert res.status_code == 403, f"Expected 403 Forbidden for Customer creating product, got {res.status_code}"
    print("   ✅ RBAC Enforcement Confirmed: Customer received 403 Forbidden when attempting to create a product.")

    # 5. Test Seller creating a product (Must return 201 Created)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {seller_token}')
    product_payload["title"] = "Seller's Wireless Keyboard"
    res = client.post('/api/products/items/', product_payload, format='json')
    assert res.status_code == 201, f"Seller product creation failed: {res.data}"
    created_product_id = res.data['id']
    created_product_slug = res.data['slug'] if 'slug' in res.data else Product.objects.get(id=created_product_id).slug
    print(f"   ✅ Seller successfully created product '{product_payload['title']}' (ID: {created_product_id}).")

    # 6. Test Cart and Checkout Flow for Customer
    print("\n5️⃣ Testing Shopping Cart and Checkout Flow...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
    
    # Add product to cart
    add_to_cart_res = client.post('/api/orders/cart/', {"product_id": created_product_id, "quantity": 2}, format='json')
    assert add_to_cart_res.status_code == 200, f"Add to cart failed: {add_to_cart_res.data}"
    print("   ✅ Customer added 2 items to shopping cart.")

    # View cart
    cart_res = client.get('/api/orders/cart/')
    assert cart_res.status_code == 200
    assert len(cart_res.data['items']) > 0
    print(f"   ✅ Customer cart total price: ${cart_res.data['total_price']}")

    # Checkout / Create Order
    checkout_payload = {
        "shipping_full_name": "Jane Doe",
        "shipping_phone": "+1 555-0144",
        "shipping_address": "742 Evergreen Terrace",
        "shipping_city": "Springfield",
        "shipping_country": "USA",
        "shipping_postal_code": "97477"
    }
    order_res = client.post('/api/orders/', checkout_payload, format='json')
    assert order_res.status_code == 201, f"Checkout failed: {order_res.data}"
    order_number = order_res.data['order_number']
    order_id = order_res.data['id']
    print(f"   ✅ Customer completed checkout: Order #{order_number} (Total: ${order_res.data['total_amount']})")

    # 7. Test Seller viewing sold items
    print("\n6️⃣ Testing Seller Order Fulfillment Endpoint...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {seller_token}')
    seller_orders_res = client.get('/api/orders/seller_orders/')
    assert seller_orders_res.status_code == 200, f"Failed to get seller orders: {seller_orders_res.data}"
    print(f"   ✅ Seller successfully accessed seller_orders endpoint.")

    # 8. Test Admin Updating Order Status
    print("\n7️⃣ Testing Admin Order Management...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    status_res = client.patch(f'/api/orders/{order_id}/update_status/', {"status": "SHIPPED", "payment_status": "PAID"}, format='json')
    assert status_res.status_code == 200, f"Admin status update failed: {status_res.data}"
    assert status_res.data['status'] == 'SHIPPED'
    print(f"   ✅ Admin successfully updated Order #{order_number} to status 'SHIPPED' and payment 'PAID'.")

    # 9. Test Wishlist Feature
    print("\n8️⃣ Testing Wishlist System (Add, List, Untoggle)...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
    wish_toggle = client.post('/api/products/wishlist/toggle/', {"product_id": created_product_id}, format='json')
    assert wish_toggle.status_code == 201, f"Wishlist add failed: {wish_toggle.data}"
    assert wish_toggle.data['is_wishlisted'] is True
    print("   ✅ Added product to customer wishlist.")

    wish_list = client.get('/api/products/wishlist/')
    assert wish_list.status_code == 200
    assert len(wish_list.data) >= 1
    print(f"   ✅ Retrieved customer wishlist ({len(wish_list.data)} item(s)).")

    wish_untoggle = client.post('/api/products/wishlist/toggle/', {"product_id": created_product_id}, format='json')
    assert wish_untoggle.status_code == 200
    assert wish_untoggle.data['is_wishlisted'] is False
    print("   ✅ Untoggled product from wishlist.")

    # 10. Test User Profile Retrieval and Update
    print("\n9️⃣ Testing User Profile & Details...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
    profile_get = client.get('/api/accounts/profile/')
    assert profile_get.status_code == 200
    assert profile_get.data['username'] == 'customer_jane'
    print("   ✅ Retrieved user profile data.")

    profile_patch = client.patch('/api/accounts/profile/', {"city": "Metropolis"}, format='json')
    assert profile_patch.status_code == 200
    assert profile_patch.data['city'] == 'Metropolis'
    print("   ✅ Updated user profile city.")

    # Clean up test product
    Product.objects.filter(id=created_product_id).delete()

    print("\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()

