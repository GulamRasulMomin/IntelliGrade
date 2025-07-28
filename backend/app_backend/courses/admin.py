from django.contrib import admin
from .models import Course, Topic, Quiz, UserCourse, TopicProgress, QuizAttempt

# Register your models here.

admin.site.register(Course)
admin.site.register(Topic)
admin.site.register(Quiz)
admin.site.register(UserCourse)
admin.site.register(TopicProgress)
admin.site.register(QuizAttempt)