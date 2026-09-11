from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_verified_seller', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_verified_seller', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Profile Info', {
            'fields': ('role', 'phone_number', 'address', 'city', 'country', 'postal_code', 'profile_image', 'is_verified_seller')
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Profile Info', {
            'fields': ('role', 'email', 'phone_number', 'address', 'city', 'country', 'postal_code', 'is_verified_seller')
        }),
    )
