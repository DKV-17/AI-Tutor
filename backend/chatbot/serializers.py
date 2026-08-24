from rest_framework import serializers
from .models import Conversation, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            'id',
            'role',
            'message',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'role',
            'created_at',
        ]


class ConversationSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Conversation
        fields = [
            'id',
            'title',
            'created_at',
            'updated_at',
            'messages',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'messages',
        ]