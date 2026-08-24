from django.urls import path

from .views import (
    CourseListCreateAPIView,
    CourseDetailAPIView,
    LessonListCreateAPIView,
    LessonDetailAPIView,
    LessonProgressAPIView,
)


urlpatterns = [
    path(
        '',
        CourseListCreateAPIView.as_view(),
        name='course-list-create'
    ),
    path(
        '<int:pk>/',
        CourseDetailAPIView.as_view(),
        name='course-detail'
    ),

    path(
    'lessons/',
    LessonListCreateAPIView.as_view(),
    name='lesson-list-create'
),

path(
    'lessons/<int:pk>/',
    LessonDetailAPIView.as_view(),
    name='lesson-detail'
),

path(
    'progress/',
    LessonProgressAPIView.as_view(),
    name='lesson-progress'
),

]