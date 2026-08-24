from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Course, Lesson, LessonProgress
from .serializers import CourseSerializer, LessonSerializer
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .serializers import LessonProgressSerializer


class CourseListCreateAPIView(APIView):

    def get(self, request):
        courses = Course.objects.filter(is_active=True)
        serializer = CourseSerializer(courses, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = CourseSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class CourseDetailAPIView(APIView):

    def get_course(self, pk):
        try:
            return Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return None

    def get(self, request, pk):
        course = self.get_course(pk)

        if course is None:
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CourseSerializer(course)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request, pk):
        course = self.get_course(pk)

        if course is None:
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CourseSerializer(
            course,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        course = self.get_course(pk)

        if course is None:
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        course.delete()

        return Response(
            {"message": "Course deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

class LessonListCreateAPIView(APIView):

    def get(self, request):
        lessons = Lesson.objects.filter(is_active=True)
        serializer = LessonSerializer(lessons, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = LessonSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LessonDetailAPIView(APIView):

    def get_lesson(self, pk):
        try:
            return Lesson.objects.get(pk=pk)
        except Lesson.DoesNotExist:
            return None

    def get(self, request, pk):
        lesson = self.get_lesson(pk)

        if lesson is None:
            return Response(
                {"error": "Lesson not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LessonSerializer(lesson)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request, pk):
        lesson = self.get_lesson(pk)

        if lesson is None:
            return Response(
                {"error": "Lesson not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LessonSerializer(
            lesson,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        lesson = self.get_lesson(pk)

        if lesson is None:
            return Response(
                {"error": "Lesson not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        lesson.delete()

        return Response(
            {"message": "Lesson deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )    

class LessonProgressAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        progress = LessonProgress.objects.filter(
            student=request.user
        )

        serializer = LessonProgressSerializer(
            progress,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        lesson_id = request.data.get('lesson')
        is_completed = request.data.get(
            'is_completed',
            False
        )

        if not lesson_id:
            return Response(
                {'error': 'lesson is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response(
                {'error': 'Lesson not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        progress, created = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson
        )

        progress.is_completed = is_completed

        if is_completed:
            progress.completed_at = timezone.now()
        else:
            progress.completed_at = None

        progress.save()

        serializer = LessonProgressSerializer(progress)

        return Response(
            serializer.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            )
        )        