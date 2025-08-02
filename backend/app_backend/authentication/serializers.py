from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, UserProfile
import re

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password_confirm')
    
    def validate_username(self, value):
        # Check if username already exists
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        
        # Validate username format (Demo_12 pattern)
        if not re.match(r'^[A-Za-z][A-Za-z0-9_]*$', value):
            raise serializers.ValidationError("Username must start with a letter and contain only letters, numbers, and underscores")
        
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    avatar = serializers.ImageField(required=False)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'avatar']
    
    def validate_username(self, value):
        if value:
            # Check if username already exists (excluding current user)
            user = self.context['request'].user
            if CustomUser.objects.filter(username=value).exclude(id=user.id).exists():
                raise serializers.ValidationError("Username already exists")
            
            # Validate username format (Demo_12 pattern)
            if not re.match(r'^[A-Za-z][A-Za-z0-9_]*$', value):
                raise serializers.ValidationError("Username must start with a letter and contain only letters, numbers, and underscores")
        
        return value
    
    def validate_email(self, value):
        if value:
            # Check if email already exists (excluding current user)
            user = self.context['request'].user
            if CustomUser.objects.filter(email=value).exclude(id=user.id).exists():
                raise serializers.ValidationError("Email already exists")
        
        return value

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)
    
    class Meta:
        model = UserProfile
        fields = ['learning_streak', 'avatar']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'date_joined', 'profile', 'avatar']
        read_only_fields = ['id', 'date_joined']