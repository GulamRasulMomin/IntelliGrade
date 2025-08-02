from django.contrib.auth.models import AbstractUser
from django.db import models
import re

class CustomUser(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='avatars/default_avatar.png')
    date_joined = models.DateTimeField(auto_now_add=True)
    
    def clean(self):
        super().clean()
        if self.username:
            # Validate username format (Demo_12 pattern)
            if not re.match(r'^[A-Za-z][A-Za-z0-9_]*$', self.username):
                raise ValueError("Username must start with a letter and contain only letters, numbers, and underscores")
        
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.username

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    learning_streak = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"