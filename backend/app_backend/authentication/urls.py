from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterAPIView.as_view(), name='register'),
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path('logout/', views.LogoutAPIView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/update/', views.UpdateProfileAPIView.as_view(), name='update_profile'),
    path('profile/change-password/', views.ChangePasswordAPIView.as_view(), name='change_password'),
    path('stats/', views.UserStatsAPIView.as_view(), name='user_stats'),
]