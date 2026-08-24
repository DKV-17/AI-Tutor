from rest_framework import serializers
from .models import Course, Lesson, LessonProgress


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'    

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = [
            'id',
            'student',
            'lesson',
            'is_completed',
            'completed_at',
        ]
        read_only_fields = [
            'id',
            'student',
            'completed_at',
        ]            