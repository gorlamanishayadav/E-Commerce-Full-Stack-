from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    SELLER = 'SELLER', 'Seller'
    CUSTOMER = 'CUSTOMER', 'Customer'

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
        help_text='Designates the role of the user (Admin, Seller, or Customer).'
    )
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_verified_seller = models.BooleanField(
        default=False,
        help_text='Sellers can be marked verified by an Admin.'
    )

    def save(self, *args, **kwargs):
        # Automatically make superusers Admin role
        if self.is_superuser and self.role != UserRole.ADMIN:
            self.role = UserRole.ADMIN
        super().save(*args, **kwargs)

    @property
    def is_admin_role(self):
        return self.role == UserRole.ADMIN or self.is_superuser or self.is_staff

    @property
    def is_seller_role(self):
        return self.role == UserRole.SELLER or self.is_admin_role

    @property
    def is_customer_role(self):
        return self.role == UserRole.CUSTOMER

    def __str__(self):
        return f"{self.username} ({self.role})"
