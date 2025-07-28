from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import LearningGoal, StudySession, Achievement
from .serializers import LearningGoalSerializer, StudySessionSerializer, AchievementSerializer

class LearningGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = LearningGoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LearningGoal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LearningGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LearningGoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LearningGoal.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def study_analytics(request):
    user = request.user
    
    # Get study sessions from last 30 days
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_sessions = StudySession.objects.filter(
        user=user,
        session_date__gte=thirty_days_ago
    )
    
    # Calculate analytics
    total_study_time = recent_sessions.aggregate(
        total=Sum('duration_minutes')
    )['total'] or 0
    
    total_sessions = recent_sessions.count()
    
    # Study streak calculation
    today = timezone.now().date()
    streak = 0
    current_date = today
    
    while True:
        if StudySession.objects.filter(
            user=user,
            session_date__date=current_date
        ).exists():
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    # Weekly study time
    weekly_data = []
    for i in range(7):
        date = today - timedelta(days=i)
        daily_time = StudySession.objects.filter(
            user=user,
            session_date__date=date
        ).aggregate(total=Sum('duration_minutes'))['total'] or 0
        
        weekly_data.append({
            'date': date.strftime('%Y-%m-%d'),
            'minutes': daily_time
        })
    
    return Response({
        'total_study_time_minutes': total_study_time,
        'total_sessions': total_sessions,
        'current_streak': streak,
        'weekly_data': weekly_data,
        'average_session_time': total_study_time / total_sessions if total_sessions > 0 else 0
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_achievements(request):
    achievements = Achievement.objects.filter(user=request.user).order_by('-earned_at')
    return Response(AchievementSerializer(achievements, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_study_session(request):
    course_id = request.data.get('course_id')
    topic_id = request.data.get('topic_id')
    duration_minutes = request.data.get('duration_minutes', 0)
    
    if not course_id or duration_minutes <= 0:
        return Response({'error': 'Invalid data'}, status=400)
    
    from courses.models import Course, Topic
    
    try:
        course = Course.objects.get(id=course_id)
        topic = None
        if topic_id:
            topic = Topic.objects.get(id=topic_id)
        
        session = StudySession.objects.create(
            user=request.user,
            course=course,
            topic=topic,
            duration_minutes=duration_minutes
        )
        
        # Check for achievements
        _check_achievements(request.user)
        
        return Response(StudySessionSerializer(session).data)
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found'}, status=404)

def _check_achievements(user):
    """Check and award achievements to user"""
    from courses.models import UserCourse, QuizAttempt
    
    # First course completion
    if UserCourse.objects.filter(user=user, completed=True).count() == 1:
        Achievement.objects.get_or_create(
            user=user,
            achievement_type='first_course'
        )
    
    # Quiz master (10+ quizzes completed)
    if QuizAttempt.objects.filter(user=user).count() >= 10:
        Achievement.objects.get_or_create(
            user=user,
            achievement_type='quiz_master'
        )
    
    # Study streaks
    today = timezone.now().date()
    streak = 0
    current_date = today
    
    while StudySession.objects.filter(
        user=user,
        session_date__date=current_date
    ).exists():
        streak += 1
        current_date -= timedelta(days=1)
    
    if streak >= 7:
        Achievement.objects.get_or_create(
            user=user,
            achievement_type='streak_7'
        )
    
    if streak >= 30:
        Achievement.objects.get_or_create(
            user=user,
            achievement_type='streak_30'
        )