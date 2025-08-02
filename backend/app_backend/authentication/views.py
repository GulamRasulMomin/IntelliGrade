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
    """
    Update user's learning streak based on study sessions and completed topics
    """
    from user_progress.models import StudySession
    from courses.models import TopicProgress
    
    learning_streak = 0
    today = timezone.now().date()
    current_date = today
    
    # Check consecutive days with study sessions or completed topics
    while True:
        # Check if user has any study session on this date
        has_study_session = StudySession.objects.filter(
            user=user,
            session_date__date=current_date
        ).exists()
        
        # Also check if user completed any topics on this date
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
    
    # Update the user's learning streak in their profile
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
    """
    Update user profile (username, email, avatar)
    """
    serializer = UserProfileUpdateSerializer(
        request.user, 
        data=request.data, 
        partial=True,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password with old password verification
    """
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
    
    # Calculate user statistics
    from courses.models import UserCourse, QuizAttempt, TopicProgress
    from user_progress.models import StudySession
    from django.utils import timezone
    from datetime import timedelta
    
    total_courses = UserCourse.objects.filter(user=user).count()
    completed_courses = UserCourse.objects.filter(user=user, completed=True).count()
    total_quizzes = QuizAttempt.objects.filter(user=user).count()
    
    # Calculate total study time from completed topics
    completed_topics = TopicProgress.objects.filter(
        user=user, 
        completed=True
    ).select_related('topic')
    
    total_study_time = 0
    
    # Calculate study time based on completed topics only
    for topic_progress in completed_topics:
        topic = topic_progress.topic
        # Parse estimated time (e.g., "2 hours", "30 minutes")
        estimated_time = topic.estimated_time
        if estimated_time:
            # Extract hours from estimated_time
            hours = 0
            
            if 'hour' in estimated_time.lower():
                try:
                    hours = int(estimated_time.split()[0])
                except (ValueError, IndexError):
                    hours = 1
            elif 'minute' in estimated_time.lower():
                try:
                    minutes = int(estimated_time.split()[0])
                    # Convert minutes to hours (round up if 30+ minutes)
                    hours = round(minutes / 60)
                except (ValueError, IndexError):
                    hours = 1
            
            # Add hours directly (no rounding needed since we're already in hours)
            total_study_time += hours * 60  # Convert to minutes for consistency
    
    # Calculate learning streak based on study sessions and completed topics
    learning_streak = update_user_learning_streak(user)
    
    return Response({
        'total_courses': total_courses,
        'completed_courses': completed_courses,
        'total_quizzes': total_quizzes,
        'learning_streak': learning_streak,
        'total_study_time': total_study_time,  # in minutes
    })