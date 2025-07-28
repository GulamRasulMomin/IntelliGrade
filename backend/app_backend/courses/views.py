from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Course, Topic, Quiz, UserCourse, TopicProgress, QuizAttempt
from .serializers import (
    CourseSerializer, TopicSerializer, QuizSerializer,
    UserCourseSerializer, TopicProgressSerializer, QuizAttemptSerializer,
    CourseGenerationSerializer
)
from ai_integration.services import AIService
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_course(request):
    serializer = CourseGenerationSerializer(data=request.data)
    if serializer.is_valid():
        course_name = serializer.validated_data['course_name']
        difficulty = serializer.validated_data['difficulty']
        duration_weeks = serializer.validated_data['duration_weeks']
        
        # Check if course already exists
        existing_course = Course.objects.filter(title__iexact=course_name).first()
        if existing_course:
            # Enroll user if not already enrolled
            user_course, created = UserCourse.objects.get_or_create(
                user=request.user,
                course=existing_course
            )
            return Response({
                'course': CourseSerializer(existing_course).data,
                'message': 'Course already exists. You have been enrolled.'
            })
        
        try:
            # Generate course using AI service
            ai_service = AIService()
            course_data = ai_service.generate_course_roadmap(course_name, difficulty, duration_weeks)
            
            # Create course
            course = Course.objects.create(
                title=course_name,
                description=course_data.get('description', f'Master {course_name} with our AI-curated learning path.'),
                difficulty=difficulty,
                estimated_duration=f"{duration_weeks} weeks"
            )
            
            # Create topics
            for i, topic_data in enumerate(course_data.get('topics', [])):
                topic = Topic.objects.create(
                    course=course,
                    title=topic_data['title'],
                    description=topic_data['description'],
                    order=i + 1,
                    notes=topic_data['notes'],
                    estimated_time=topic_data['estimated_time']
                )
                
                # Generate quiz for topic
                quiz_questions = ai_service.generate_quiz(topic_data['title'], course_name)
                Quiz.objects.create(
                    topic=topic,
                    questions=quiz_questions
                )
            
            # Enroll user in course
            UserCourse.objects.create(user=request.user, course=course)
            
            return Response({
                'course': CourseSerializer(course).data,
                'message': 'Course generated successfully!'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate course: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    
    # Get or create user course enrollment
    user_course, created = UserCourse.objects.get_or_create(
        user=request.user,
        course=course
    )
    
    # Get topic progress
    topics_with_progress = []
    for topic in course.topics.all():
        progress, _ = TopicProgress.objects.get_or_create(
            user=request.user,
            topic=topic
        )
        topic_data = TopicSerializer(topic).data
        topic_data['progress'] = TopicProgressSerializer(progress).data
        topics_with_progress.append(topic_data)
    
    course_data = CourseSerializer(course).data
    course_data['topics'] = topics_with_progress
    course_data['user_progress'] = UserCourseSerializer(user_course).data
    
    return Response(course_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_topic_notes(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    
    # Mark notes as viewed
    progress, _ = TopicProgress.objects.get_or_create(
        user=request.user,
        topic=topic
    )
    progress.notes_viewed = True
    progress.save()
    
    return Response(TopicSerializer(topic).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_topic_quiz(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    quiz = get_object_or_404(Quiz, topic=topic)
    quiz_data = QuizSerializer(quiz).data
    # Detect fallback/mock quiz by checking for generic question pattern
    is_fallback = False
    questions = quiz_data.get('questions', [])
    if questions and isinstance(questions, list):
        first_q = questions[0]
        if (
            isinstance(first_q, dict) and
            'main purpose of' in first_q.get('question', '').lower() and
            'fundamental concept' in first_q.get('explanation', '').lower()
        ):
            is_fallback = True
    quiz_data['is_fallback'] = is_fallback
    return Response(quiz_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    quiz = get_object_or_404(Quiz, topic=topic)
    
    user_answers = request.data.get('answers', [])
    questions = quiz.questions
    
    # Calculate score
    score = 0
    for i, question in enumerate(questions):
        if i < len(user_answers) and user_answers[i] == question.get('correct_answer'):
            score += 1
    
    # Save quiz attempt
    quiz_attempt = QuizAttempt.objects.create(
        user=request.user,
        quiz=quiz,
        score=score,
        total_questions=len(questions),
        answers=user_answers
    )
    
    # Update topic progress
    progress, _ = TopicProgress.objects.get_or_create(
        user=request.user,
        topic=topic
    )
    progress.quiz_completed = True
    if score >= len(questions) * 0.7:  # 70% passing score
        progress.completed = True
        progress.completed_at = timezone.now()
    progress.save()
    
    # Update course progress
    user_course = UserCourse.objects.get(user=request.user, course=topic.course)
    completed_topics = TopicProgress.objects.filter(
        user=request.user,
        topic__course=topic.course,
        completed=True
    ).count()
    total_topics = topic.course.topics.count()
    
    user_course.progress_percentage = int((completed_topics / total_topics) * 100)
    if user_course.progress_percentage == 100:
        user_course.completed = True
        user_course.completed_at = timezone.now()
    user_course.save()
    
    return Response({
        'score': score,
        'total_questions': len(questions),
        'percentage': int((score / len(questions)) * 100),
        'passed': score >= len(questions) * 0.7
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_courses(request):
    user_courses = UserCourse.objects.filter(user=request.user).order_by('-enrolled_at')
    return Response(UserCourseSerializer(user_courses, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def featured_courses(request):
    # Return some featured/popular courses
    featured = Course.objects.all()[:4]
    return Response(CourseSerializer(featured, many=True).data)