from rest_framework import serializers
from .models import StudySession, Achievement

class StudySessionSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    
    class Meta:
        model = StudySession
        fields = ['id', 'course_title', 'topic_title', 'duration_minutes', 'session_date']

class AchievementSerializer(serializers.ModelSerializer):
    achievement_name = serializers.CharField(source='get_achievement_type_display', read_only=True)
    
    class Meta:
        model = Achievement
        fields = ['id', 'achievement_type', 'achievement_name', 'earned_at']