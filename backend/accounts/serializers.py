from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Token Serializer that adds user details and role to token claims & response body.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims embedded into JWT
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['is_verified_seller'] = user.is_verified_seller
        token['is_superuser'] = user.is_superuser
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user information directly to login response payload
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_verified_seller': self.user.is_verified_seller,
            'phone_number': self.user.phone_number,
            'address': self.user.address,
            'city': self.user.city,
            'country': self.user.country,
            'profile_image': self.user.profile_image.url if self.user.profile_image else None,
        }
        return data

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=['CUSTOMER', 'SELLER'], default='CUSTOMER')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password_confirm',
            'role', 'first_name', 'last_name', 'phone_number',
            'address', 'city', 'country', 'postal_code'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'first_name', 'last_name',
            'phone_number', 'address', 'city', 'country', 'postal_code',
            'profile_image', 'is_verified_seller', 'date_joined'
        ]
        read_only_fields = ['id', 'username', 'role', 'is_verified_seller', 'date_joined']

class UserAdminManageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'first_name', 'last_name',
            'phone_number', 'address', 'city', 'country', 'postal_code',
            'is_active', 'is_verified_seller', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value
