from django.urls import path
from .views import (
    StudyAnalyticsAPIView,
    UserAchievementsAPIView,
    LogStudySessionAPIView,
)

urlpatterns = [
    path('analytics/', StudyAnalyticsAPIView.as_view(), name='study_analytics'),
    path('achievements/', UserAchievementsAPIView.as_view(), name='user_achievements'),
    path('log-session/', LogStudySessionAPIView.as_view(), name='log_study_session'),
]
