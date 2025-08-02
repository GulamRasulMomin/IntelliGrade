"""
URL configuration for app_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
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
    
    <h3>AI Integration (/api/ai/)</h3>
    <ul>
        <li>POST /api/ai/chat/ - AI chat interface</li>
        <li>POST /api/ai/explain/ - Get AI explanations</li>
        <li>POST /api/ai/summarize/ - AI content summarization</li>
    </ul>
    
    <h3>Admin</h3>
    <ul>
        <li>GET /admin/ - Django admin interface</li>
    </ul>
    """)

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # Authentication API endpoints
    path('api/auth/', include('authentication.urls')),
    
    # Courses API endpoints
    path('api/courses/', include('courses.urls')),
    
    # User Progress API endpoints
    path('api/progress/', include('user_progress.urls')),   
     
    # Root endpoint with API documentation
    path('', index, name='index'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
