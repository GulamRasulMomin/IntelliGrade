from django.urls import path
from .views import (
    GenerateCourseAPIView,
    CourseDetailAPIView,
    TopicNotesAPIView,
    TopicQuizAPIView,
    SubmitQuizAPIView,
    MyCoursesAPIView,
    FeaturedCoursesAPIView
)

urlpatterns = [
    path('generate/', GenerateCourseAPIView.as_view(), name='generate_course'),
    path('<int:course_id>/', CourseDetailAPIView.as_view(), name='get_course'),
    path('topic/<int:topic_id>/notes/', TopicNotesAPIView.as_view(), name='get_topic_notes'),
    path('topic/<int:topic_id>/quiz/', TopicQuizAPIView.as_view(), name='get_topic_quiz'),
    path('topic/<int:topic_id>/submit-quiz/', SubmitQuizAPIView.as_view(), name='submit_quiz'),
    path('my-courses/', MyCoursesAPIView.as_view(), name='my_courses'),
    path('featured/', FeaturedCoursesAPIView.as_view(), name='featured_courses'),
]
