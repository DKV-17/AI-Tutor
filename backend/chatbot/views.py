import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from openai import OpenAI

from .models import Conversation, ChatMessage
from .serializers import ConversationSerializer


class ChatAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        message = request.data.get('message')
        conversation_id = request.data.get('conversation_id')

        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get existing conversation or create a new one
        if conversation_id:
            try:
                conversation = Conversation.objects.get(
                    id=conversation_id,
                    student=request.user
                )
            except Conversation.DoesNotExist:
                return Response(
                    {'error': 'Conversation not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            conversation = Conversation.objects.create(
                student=request.user,
                title=message[:50]
            )

        # Save user's message
        ChatMessage.objects.create(
            conversation=conversation,
            role='user',
            message=message
        )

        try:
            # Create OpenAI client
            client = OpenAI(
                api_key=os.getenv('OPENAI_API_KEY')
            )

            # Get conversation history
            previous_messages = conversation.messages.order_by(
                'created_at'
            )

            conversation_history = []

            for chat_message in previous_messages:
                conversation_history.append({
                    "role": chat_message.role,
                    "content": chat_message.message
                })

            # Send conversation history to OpenAI
            response = client.responses.create(
                model="gpt-5-mini",
                instructions=(
                    "You are an AI Tutor for an e-learning platform. "
                    "Explain concepts clearly and simply. "
                    "Use the previous conversation to understand context. "
                    "When appropriate, give examples."
                ),
                input=conversation_history
            )

            ai_response = response.output_text

        except Exception as e:
            return Response(
                {
                    'error': 'AI service is currently unavailable.',
                    'details': str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Save AI response
        ChatMessage.objects.create(
            conversation=conversation,
            role='assistant',
            message=ai_response
        )

        serializer = ConversationSerializer(conversation)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )