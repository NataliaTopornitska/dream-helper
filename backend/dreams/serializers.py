from rest_framework import serializers

from dreams.models import Category, Comment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "description")


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ("id", "owner", "dream", "content", "created_at")

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Comment must not be empty.")
        return value
