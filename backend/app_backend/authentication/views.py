from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser, UserProfile
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer
)

def update_user_learning_streak(user):
    from user_progress.models import StudySession
    from courses.models import TopicProgress
    
    learning_streak = 0
    today = timezone.now().date()
    current_date = today
    
    while True:
        has_study_session = StudySession.objects.filter(
            user=user,
            session_date__date=current_date
        ).exists()
        
        has_completed_topic = TopicProgress.objects.filter(
            user=user,
            completed=True,
            completed_at__date=current_date
        ).exists()
        
        if has_study_session or has_completed_topic:
            learning_streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    profile = user.profile
    if profile.learning_streak != learning_streak:
        profile.learning_streak = learning_streak
        profile.save()
    
    return learning_streak

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserProfileUpdateSerializer(
        request.user, 
        data=request.data, 
        partial=True,
        context={'request': request}
    )
    
    if serializer.is_valid():
        if 'avatar' in request.FILES:            
            request.user.avatar = request.FILES['avatar']
            request.user.save()
        
        serializer.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    user = request.user
    profile = user.profile
    
    from courses.models import UserCourse, QuizAttempt, TopicProgress
    from user_progress.models import StudySession
    from django.utils import timezone
    from datetime import timedelta
    
    total_courses = UserCourse.objects.filter(user=user).count()
    completed_courses = UserCourse.objects.filter(user=user, completed=True).count()
    total_quizzes = QuizAttempt.objects.filter(user=user).count()
    
    completed_topics = TopicProgress.objects.filter(
        user=user, 
        completed=True
    ).select_related('topic')
    
    total_study_time = 0
    
    for topic_progress in completed_topics:
        topic = topic_progress.topic
        estimated_time = topic.estimated_time
        if estimated_time:
            hours = 0
            
            if 'hour' in estimated_time.lower():
                try:
                    hours = int(estimated_time.split()[0])
                except (ValueError, IndexError):
                    hours = 1
            elif 'minute' in estimated_time.lower():
                try:
                    minutes = int(estimated_time.split()[0])
                    hours = round(minutes / 60)
                except (ValueError, IndexError):
                    hours = 1
            
            total_study_time += hours * 60
    
    learning_streak = update_user_learning_streak(user)
    
    return Response({
        'total_courses': total_courses,
        'completed_courses': completed_courses,
        'total_quizzes': total_quizzes,
        'learning_streak': learning_streak,
        'total_study_time': total_study_time,
    })