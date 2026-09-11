from django.urls import path
from .views import (
    RegisterView,
    UserProfileView,
    ChangePasswordView,
    AdminUserListView,
    AdminUserDetailView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='account-register'),
    path('profile/', UserProfileView.as_view(), name='account-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='account-change-password'),
    
    # Admin User Management
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
