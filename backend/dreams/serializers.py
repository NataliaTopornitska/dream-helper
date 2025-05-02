from django.db.models import Sum, ExpressionWrapper
from rest_framework import serializers

from dreams.models import Category, Comment, Dream, Donation
from rest_framework.fields import ImageField, DecimalField, FloatField

from users.models import DreamerProfile
from users.serializers import DreamerProfileCreateSerializer, DreamerProfileSerializer

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
    photo_url = serializers.URLField(read_only=True)
    thumbnail_url = serializers.URLField(read_only=True)
    number_donations = serializers.SerializerMethodField()  # count donations
    total_amount_donations = serializers.SerializerMethodField()  #  total amount
    number_comments = serializers.SerializerMethodField()
    level_completed = serializers.SerializerMethodField()

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
            "photo_url",
            "thumbnail_url",
            "status",
            "created_at",
            "number_donations",
            "total_amount_donations",
            "number_comments",
            "number_views",
            "level_completed",  # in %
            "completed_at",
        )

    def get_number_donations(self, obj):
        return obj.donations.filter(status="Paid").count()  # donations - related_name

    def get_number_comments(self, obj):
        return obj.comments.count()  # comments - related_name

    def get_total_amount_donations(self, obj):
        return (
            obj.donations.filter(status="Paid").aggregate(total=Sum("amount"))["total"]
            or 0
        )

    def get_level_completed(self, obj):
        goal = obj.goal
        total = self.get_total_amount_donations(obj)
        if not goal:
            return 0
        try:
            level = float(total) / float(goal) * 100
        except Exception:
            level = 0
        return round(level, 2)


class DreamCreateSerializer(DreamBaseSerializer):
    dreamer = DreamerProfileCreateSerializer(
        write_only=True, required=False, allow_null=True
    )
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
            to_another = validated_data.get("to_another")
            if to_another is False:
                validated_data.pop("dreamer", None)
            else:
                dreamer_data = validated_data.pop("dreamer", None)
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


class RandomDreamsSerializer(DreamBaseSerializer):
    pass


class DreamPhotoSerializer(serializers.ModelSerializer):
    photo = ImageField()

    class Meta:
        model = Dream
        fields = ("id", "photo")


class DreamUpdateSerializer(serializers.ModelSerializer):
    new_category = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Dream
        fields = (
            "id",
            "owner",
            "to_another",
            "dreamer",
            "title",
            "categories",
            "new_category",
            "content",
            "created_at",
            "goal",
            "status",
        )

    def update(self, instance, validated_data):

        new_category = validated_data.pop("new_category", None)

        # Update categories
        categories_data = validated_data.pop("categories", None)
        if new_category:
            new_category, _ = Category.objects.get_or_create(name=new_category.title())
            categories_data.append(new_category)
        if categories_data:
            instance.categories.set(categories_data)  # update relationships

        # Update another fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class AddDonationSerializer(serializers.ModelSerializer):
    AMOUNT_CHOICES = [
        (5, "5"),
        (15, "15"),
        (30, "30"),
    ]

    dream = serializers.CharField(read_only=True)
    amount = serializers.ChoiceField(choices=AMOUNT_CHOICES)
    your_amount = serializers.FloatField(required=False, default=0)
    is_anonymous = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = Donation
        fields = (
            "dream",
            "amount",
            "your_amount",
            "is_anonymous",
        )

    def validate(self, data):
        # if your_amount: ignore amount
        if data.get("your_amount", 0) > 0:
            data["amount"] = None
        elif not data.get("amount"):
            raise serializers.ValidationError("For donation: amount is required.")
        return data

    def create(self, validated_data):
        print(f'{self.context["request"]=}')
        user = self.context["request"].user
        if user.is_authenticated:
            validated_data["donator"] = user
        else:
            validated_data["donator"] = None
            validated_data["is_anonymous"] = True  # anonymous
        return super().create(validated_data)


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = (
            "id",
            "donator",
            "dream",
            "amount",
            "status",
            "is_anonymous",
            "date",
            "url_payment",
        )


class AddCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ("content",)
