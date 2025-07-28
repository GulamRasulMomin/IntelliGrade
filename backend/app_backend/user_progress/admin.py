from django.contrib import admin
from .models import LearningGoal, StudySession, Achievement
# Register your models here.

admin.site.register(LearningGoal)
admin.site.register(StudySession)  
admin.site.register(Achievement)