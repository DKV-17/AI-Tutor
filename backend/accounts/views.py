from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer
from .permissions import IsAdminUserRole


class RegisterAPIView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "Registration successful"
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

from rest_framework.permissions import IsAuthenticated


class ProfileAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response(
            {
                "message": "You are authenticated",
                "username": request.user.username,
                "email": request.user.email,
                "role": request.user.role,
            },
            status=status.HTTP_200_OK
        )

class AdminDashboardAPIView(APIView):

    permission_classes = [IsAdminUserRole]

    def get(self, request):
        return Response(
            {
                "message": "Welcome to the Admin Dashboard",
                "username": request.user.username,
                "role": request.user.role,
            },
            status=status.HTTP_200_OK
        )        