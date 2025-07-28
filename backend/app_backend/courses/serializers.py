from rest_framework import serializers
from .models import Course, Topic, Quiz, UserCourse, TopicProgress, QuizAttempt

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'title', 'description', 'order', 'notes', 'estimated_time']

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'questions', 'created_at']

class CourseSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'difficulty', 'estimated_duration', 'topics', 'created_at']

class UserCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = UserCourse
        fields = ['id', 'course', 'enrolled_at', 'completed', 'completed_at', 'progress_percentage']

class TopicProgressSerializer(serializers.ModelSerializer):
    topic = TopicSerializer(read_only=True)
    
    class Meta:
        model = TopicProgress
        fields = ['id', 'topic', 'completed', 'completed_at', 'notes_viewed', 'quiz_completed']

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'score', 'total_questions', 'answers', 'completed_at']

class CourseGenerationSerializer(serializers.Serializer):
    course_name = serializers.CharField(max_length=200)
    difficulty = serializers.ChoiceField(
        choices=['beginner', 'intermediate', 'advanced'],
        default='beginner'
    )
    duration_weeks = serializers.IntegerField(default=4, min_value=1, max_value=12)