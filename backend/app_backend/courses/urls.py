from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_course, name='generate_course'),
    path('<int:course_id>/', views.get_course, name='get_course'),
    path('topic/<int:topic_id>/notes/', views.get_topic_notes, name='get_topic_notes'),
    path('topic/<int:topic_id>/quiz/', views.get_topic_quiz, name='get_topic_quiz'),
    path('topic/<int:topic_id>/submit-quiz/', views.submit_quiz, name='submit_quiz'),
    path('my-courses/', views.my_courses, name='my_courses'),
    path('featured/', views.featured_courses, name='featured_courses'),
]