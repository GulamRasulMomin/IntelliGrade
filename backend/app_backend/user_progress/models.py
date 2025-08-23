from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class StudySession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    topic = models.ForeignKey('courses.Topic', on_delete=models.CASCADE, null=True, blank=True)
    duration_minutes = models.IntegerField()
    session_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.course.title} - {self.duration_minutes}min"

class Achievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('first course', 'First Course Completed'),
        ('quiz master', 'Quiz Master'),
        ('streak 7', '7 Day Streak'),
        ('streak 30', '30 Day Streak'),
        ('fast learner', 'Fast Learner'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'achievement_type', 'earned_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_achievement_type_display()} - {self.earned_at.date()}"