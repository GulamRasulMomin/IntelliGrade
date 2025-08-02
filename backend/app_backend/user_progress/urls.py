from django.urls import path
from . import views

urlpatterns = [
    path('analytics/', views.study_analytics, name='study_analytics'),
    path('achievements/', views.user_achievements, name='user_achievements'),
    path('log-session/', views.log_study_session, name='log_study_session'),
]