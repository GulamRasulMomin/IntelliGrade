from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import StudySession, Achievement
from .serializers import StudySessionSerializer, AchievementSerializer
from courses.models import Course, Topic
from authentication.views import update_user_learning_streak


class StudyAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_sessions = StudySession.objects.filter(
            user=user, session_date__gte=thirty_days_ago
        )

        total_study_time = recent_sessions.aggregate(total=Sum('duration_minutes'))['total'] or 0
        total_sessions = recent_sessions.count()

        # Streak Calculation
        today = timezone.now().date()
        streak = 0
        current_date = today
        while True:
            if StudySession.objects.filter(user=user, session_date__date=current_date).exists():
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break

        weekly_data = []
        for i in range(7):
            date = today - timedelta(days=i)
            daily_time = StudySession.objects.filter(
                user=user, session_date__date=date
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


class UserAchievementsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        achievements = Achievement.objects.filter(user=request.user).order_by('-earned_at')
        serializer = AchievementSerializer(achievements, many=True)
        return Response(serializer.data)


class LogStudySessionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        topic_id = request.data.get('topic_id')
        duration_minutes = request.data.get('duration_minutes', 0)

        if not course_id or duration_minutes <= 0:
            return Response({'error': 'Invalid data'}, status=400)

        try:
            course = Course.objects.get(id=course_id)
            topic = Topic.objects.get(id=topic_id) if topic_id else None

            session = StudySession.objects.create(
                user=request.user,
                course=course,
                topic=topic,
                duration_minutes=duration_minutes
            )

            update_user_learning_streak(request.user)
            _check_achievements(request.user)

            serializer = StudySessionSerializer(session)
            return Response(serializer.data)

        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=404)


def _check_achievements(user):
    from courses.models import UserCourse, QuizAttempt

    if UserCourse.objects.filter(user=user, completed=True).count() == 1:
        Achievement.objects.get_or_create(user=user, achievement_type='First Course Completed')

    if QuizAttempt.objects.filter(user=user).count() >= 10:
        Achievement.objects.get_or_create(user=user, achievement_type='Quiz Master')

    learning_streak = update_user_learning_streak(user)

    if learning_streak >= 7:
        Achievement.objects.get_or_create(user=user, achievement_type='7 Day Streak')
    if learning_streak >= 30:
        Achievement.objects.get_or_create(user=user, achievement_type='30 Day Streak')
