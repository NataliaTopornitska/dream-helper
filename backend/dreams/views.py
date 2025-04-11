import os
import random

from django.db.models import Sum
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from dreams.models import Category, Dream, Donation
from dreams.serializers import (
    CategorySerializer,
    DreamCreateSerializer,
    DreamBaseSerializer,
    RandomDreamsSerializer,
    DreamPhotoSerializer,
)

from utils.email import send_email_with_template
from utils.storage import (
    get_s3_client,
    get_file_name,
    delete_image_from_storage,
    upload_image_and_miniature_to_storage,
)

from app import settings

from users.models import User, DreamerProfile

from app.settings import BUCKET_NAME, STORAGE_HOST, STORAGE_PORT, RESIZE_PHOTO_DREAM


class CategoryView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    # mixins.DestroyModelMixin,
    GenericViewSet,
):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (IsAdminUser,)


class DreamViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet,
):
    queryset = Dream.objects.all()
    serializer_class = DreamBaseSerializer

    def retrieve(self, request, *args, **kwargs):
        # every time, if watch detail of Dream, number_views +1
        instance = self.get_object()
        instance.number_views += 1
        instance.save(update_fields=["number_views"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        dream = self.serializer_class.Meta.model.objects.get(pk=response.data["id"])

        context = {
            "owner": request.user,
            "application": dream.title,
        }

        send_email_with_template(
            subject="Your request for Dream fulfillment has been received",
            template_name=os.path.join(
                settings.BASE_DIR,
                "templates",
                "email",
                "confirm_received_new_dream_email.html",
            ),
            context=context,
            recipient_email=dream.owner.email,
        )
        # mark for owner: is_owner = True
        owner = dream.owner
        owner.is_owner = True
        owner.save()

        return response

    def get_serializer_class(self):
        if self.action == "list":
            return DreamBaseSerializer
        if self.action == "retrieve":
            return DreamBaseSerializer
        if self.action == "create":
            return DreamCreateSerializer
        if self.action == "get_random_dreams":
            return RandomDreamsSerializer
        if self.action == "upload_dream_photo":
            return DreamPhotoSerializer
        # if self.action == "update":
        #     return DreamUpdateSerializer
        # if self.action == "make_donation":
        #     return AddDonationSerializer
        return DreamBaseSerializer

        # def get_permissions(self):
        #     if self.action == "create":  # create only AuthUser
        #         return (IsAuthenticated,)
        #     if self.action == "update":  # update only Admin
        #         return (IsAdminUser,)
        #     return super().get_permissions()

    @action(
        methods=["get"],
        detail=False,
        url_path="get_random_dreams",
    )
    def get_random_dreams(self, request):
        active_dreams = Dream.objects.filter(status="Active")
        numbers = settings.RANDOM_DREAMS_HOME
        numbers = min(int(numbers), len(active_dreams))
        ids = Dream.objects.values_list("id", flat=True)
        random_ids = random.sample(list(ids), numbers)  # get number random ID
        queryset = Dream.objects.filter(id__in=random_ids).order_by(
            "?"
        )  #  without ordering

        return Response(
            RandomDreamsSerializer(queryset, many=True).data,
            status=status.HTTP_200_OK,
        )

    @action(
        methods=["post"],
        detail=True,
        permission_classes=(IsAuthenticated,),
        url_path="upload_dream_photo",
    )
    def upload_dream_photo(self, request, pk=None):
        dream = self.get_object()
        # s3_client = get_s3_client()

        # Delete old photo_url & thumbnail_url if it exists from bucket
        if dream.photo_url:
            delete_image_from_storage(dream.photo_url)

        # upload new photo
        file = request.FILES.get("photo")

        if not file:
            return Response(
                {"error": "There is no file."}, status=status.HTTP_400_BAD_REQUEST
            )

        # check MIME
        if not file.content_type.startswith("image/"):
            return Response(
                {"error": "Uploaded file is not an image."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # check size, not empty
        if file.size == 0:
            return Response(
                {"error": "Uploaded file is empty."}, status=status.HTTP_400_BAD_REQUEST
            )

        # create miniature, upload original & miniature to s3 storage
        upload_image_and_miniature_to_storage(file, dream, "dreams", "photo_url")

        return Response(
            {
                "message": "File upload successful.",
                "photo_url": dream.photo_url,
                "thumbnail_url": dream.thumbnail_url,
            },
            status=status.HTTP_200_OK,
        )


class DreamStatisticsView(APIView):

    def get(self, request, *args, **kwargs):
        total_dreams = Dream.objects.count()
        people = (
            User.objects.count() + DreamerProfile.objects.count()
        )  #  later may be only active users

        anonymous_donations = (
            Donation.objects.filter(is_anonymous=True).aggregate(
                total_sum=Sum("amount")
            )["total_sum"]
            or 0
        )

        total_donations = (
            Donation.objects.aggregate(total_sum=Sum("amount"))["total_sum"] or 0
        )

        data = {
            "total_dreams": total_dreams,
            "people": people,
            "anonymous_donations": anonymous_donations,
            "total_donations": total_donations,
        }

        return Response(data)
