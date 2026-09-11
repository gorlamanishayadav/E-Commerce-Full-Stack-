from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartView, CartItemDetailView, OrderViewSet

router = DefaultRouter()
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    # Cart endpoints
    path('cart/', CartView.as_view(), name='cart-detail'),
    path('cart/items/<int:item_id>/', CartItemDetailView.as_view(), name='cart-item-detail'),
    
    # Order endpoints
    path('', include(router.urls)),
]
