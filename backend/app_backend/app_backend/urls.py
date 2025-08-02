"""
URL configuration for app_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def index(request):
    return HttpResponse("""
    <h1>IntelliGrade Backend API</h1>
    <h2>Available API Endpoints:</h2>
    
    <h3>Authentication (/api/auth/)</h3>
    <ul>
        <li>POST /api/auth/register/ - User registration</li>
        <li>POST /api/auth/login/ - User login</li>
        <li>POST /api/auth/logout/ - User logout</li>
        <li>POST /api/auth/token/refresh/ - Refresh JWT token</li>
        <li>GET /api/auth/profile/ - Get user profile</li>
        <li>GET /api/auth/stats/ - Get user statistics</li>
    </ul>
    
    <h3>Courses (/api/courses/)</h3>
    <ul>
        <li>POST /api/courses/generate/ - Generate new course</li>
        <li>GET /api/courses/{course_id}/ - Get specific course</li>
        <li>GET /api/courses/topic/{topic_id}/notes/ - Get topic notes</li>
        <li>GET /api/courses/topic/{topic_id}/quiz/ - Get topic quiz</li>
        <li>POST /api/courses/topic/{topic_id}/submit-quiz/ - Submit quiz answers</li>
        <li>GET /api/courses/my-courses/ - Get user's courses</li>
        <li>GET /api/courses/featured/ - Get featured courses</li>
    </ul>
    
    <h3>User Progress (/api/progress/)</h3>
    <ul>
        <li>GET /api/progress/analytics/ - Get study analytics</li>
        <li>GET /api/progress/achievements/ - Get user achievements</li>
        <li>POST /api/progress/log-session/ - Log study session</li>
    </ul>
    
    <h3>Admin</h3>
    <ul>
        <li>GET /admin/ - Django admin interface</li>
    </ul>
    """)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/progress/', include('user_progress.urls')),
    path('', index, name='index'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
