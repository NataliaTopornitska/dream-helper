from django.db.models import Sum
from django.template.context_processors import request
from rest_framework import serializers

from dreams.models import Category, Comment, Dream

from users.models import DreamerProfile
from users.serializers import DreamerProfileCreateSerializer

from users.models import Country, City


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


class DreamBaseSerializer(serializers.ModelSerializer):
    number_donations = serializers.SerializerMethodField()  # count donations
    total_amount_donations = serializers.SerializerMethodField()  #  total amount
    number_comments = serializers.SerializerMethodField()

    class Meta:
        model = Dream
        fields = (
            "id",
            "owner",
            "title",
            "to_another",
            "dreamer",
            "categories",
            "content",
            "goal",
            "photo",
            "status",
            "created_at",
            "number_donations",
            "total_amount_donations",
            "number_comments",
            "number_views",
        )

    def get_number_donations(self, obj):
        return obj.donations.count()  # donations - related_name

    def get_number_comments(self, obj):
        return obj.comments.count()  # comments - related_name

    def get_total_amount_donations(self, obj):
        return obj.donations.aggregate(total=Sum("amount"))["total"] or 0


class DreamCreateSerializer(DreamBaseSerializer):
    dreamer = DreamerProfileCreateSerializer()
    new_category = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Dream
        fields = (
            "id",
            "title",
            "to_another",
            "dreamer",
            "categories",
            "new_category",
            "content",
            "goal",
        )

    def create(self, validated_data):
        # get data Dreamer
        try:
            dreamer = None
            dreamer_data = validated_data.pop("dreamer", None)
            print(f"{dreamer_data=}")
            to_another = validated_data.pop("to_another")
            if to_another and dreamer_data:
                # create Dreamer if dreamer_data
                if dreamer_data and any(dreamer_data.values()):  # check that not empty

                    if isinstance(dreamer_data.get("country"), Country):
                        dreamer_data["country"] = dreamer_data["country"].id
                    if isinstance(dreamer_data.get("city"), City):
                        dreamer_data["city"] = dreamer_data["city"].id

                    dreamer_serializer = DreamerProfileCreateSerializer(
                        data=dreamer_data
                    )
                    dreamer_serializer.is_valid(raise_exception=True)
                    dreamer = dreamer_serializer.save()

                print(f"{dreamer=}")
            categories_data = validated_data.pop("categories", [])

            new_category = validated_data.pop("new_category", None)

            # create Dream and relate with owner=user, Dreamer
            user = self.context.get("request").user

            dream = Dream.objects.create(owner=user, dreamer=dreamer, **validated_data)

            if new_category:
                new_category, _ = Category.objects.get_or_create(
                    name=new_category.title()
                )
                categories_data.append(new_category)

            dream.categories.set(categories_data)

            return dream

        except Exception as e:
            raise serializers.ValidationError(f"Dream creation failed: {e}")
