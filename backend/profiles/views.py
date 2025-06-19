from rest_framework import generics, mixins, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from drf_spectacular.utils import extend_schema

from users.models import (
    # User,
    ActivationToken,
    Subscriber,
)
from profiles.models import (
    UserProfile,
    DreamerProfile,
    Country,
    City,
)
from dreams.models import Dream, Donation

from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from users.serializers import (
    UserSerializer,
    UserUpdateSerializer,
    SubscriberSerializer,
    SubscriberCreateSerializer,
    LogoutSerializer,
)
from profiles.serializers import (
    UserProfileCreateSerializer,
    UserProfileSerializer,
    DreamerProfileSerializer,
    DreamerProfileCreateSerializer,
    UserProfileAvatarSerializer,
    CountrySerializer,
    CitySerializer,
    CityUpdateSerializer,
    UserMyDreamsSerializer,
    UserMyDonationsSerializer,
    UserPreparedDonationsSerializer,
)
from utils.storage import (
    delete_image_from_storage,
    upload_image_and_miniature_to_storage,
)

from app.settings import RESIZE_PHOTO_AVATAR

from .filters import CityFilter
from django_filters import rest_framework as filters


# @extend_schema(
#    summary="Get User's Profile",
#    description="Get the current User's Profile. Error 401 - if the account of User is not activated.",
# )
class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileCreateSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        if not self.request.user.is_active:
            return Response(
                {
                    "error": "We are very sorry, but your account is not activated. First you need to activate the link from the letter you received to your email."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return self.request.user.userprofile

    def get_serializer_class(self):
        if self.request.method in ("POST", "PUT", "PATCH"):
            return UserProfileCreateSerializer
        return UserProfileSerializer


@extend_schema(
    summary="Get My Dreams",
    description="Get a list of user Dreams (User is owner).",
    methods=["GET"],
)
class UserMyDreamsView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMyDreamsSerializer

    def get(self, request):
        """Get a list Dreams for active user-owner"""
        user = request.user

        dreams = user.dreams.all().order_by("-created_at")  # get all user dreams
        serializer = self.serializer_class(dreams, many=True)
        return Response(serializer.data)


@extend_schema(
    summary="Get My Donations",
    description="Get a list of Dreams where the current User is a donor (with information about his donations).",
    methods=["GET"],
)
class UserMyDonationsView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMyDonationsSerializer

    def get(self, request):
        """Get a list Dreams where the current User is donor."""
        user = request.user
        if user.is_donator:
            dreams = (
                Dream.objects.filter(donations__donator=user, donations__status="Paid")
                .distinct()
                .order_by("-created_at")
            )
            serializer = self.serializer_class(
                dreams, many=True, context={"request": request}
            )
            return Response(serializer.data)
        return Response(
            {"message": "You haven't made any donations yet."},
            status=status.HTTP_204_NO_CONTENT,
        )


@extend_schema(
    summary="Get Prepared Donations",
    description="Get a list of user's prepared donations that have not yet been paid (with the ability to cancel/continue the payment process).",
    methods=["GET", "POST", "PATCH"],
)
class UserPreparedDonationsView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserPreparedDonationsSerializer

    def get(self, request):
        """Get a list of user's prepared donations that have not yet been paid."""
        user = request.user
        if user.is_donator:
            prepared_donations = Donation.objects.filter(
                donator=user, status="Prepared"
            ).order_by("-date")
            serializer = self.serializer_class(
                prepared_donations, many=True, context={"request": request}
            )
            return Response(serializer.data)
        return Response(
            {"message": "You haven't any prepared donations."},
            status=status.HTTP_204_NO_CONTENT,
        )


@extend_schema(
    summary="Upload avatar",
    description="Add avatar to current User's Profile. Error 401 - if the account of User is not activated.",
)
class UploadAvatarView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileAvatarSerializer

    def get_object(self):
        if not self.request.user.is_active:
            return Response(
                {
                    "error": "We are very sorry, but your account is not activated. First you need to activate the link from the letter you received to your email."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return self.request.user.userprofile

    def post(self, request):
        print("FILES:", request.FILES)
        print("DATA:", request.data)

        profile = self.get_object()

        # # Delete old avatar & thumbnail, if it exists, from bucket
        if profile.avatar_url:
            delete_image_from_storage(profile.avatar_url)

        # # upload new photo avatar
        file = request.FILES.get("photo_avatar")
        if not file:
            return Response(
              {"error": "There is no file. "
                          "Select a file of the following format: jpg, webp, jfif & png."},
                  status=status.HTTP_400_BAD_REQUEST
            )

        # check MIME
        if not file.content_type.startswith("image/"):
            return Response(
                {"error": "Uploaded file is not an image. "
                          "Allowed formats: jpg, webp, jfif & png."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # # check size, not empty
        if file.size == 0:
            return Response(
                {"error": "Uploaded file is empty."}, status=status.HTTP_400_BAD_REQUEST
            )

        # create miniature, upload original & miniature to s3 storage
        upload_image_and_miniature_to_storage(
            file,
            profile,
            "avatars",
            "avatar_url",
            int(RESIZE_PHOTO_AVATAR),
            int(RESIZE_PHOTO_AVATAR),
        )

        return Response(
            {
                "message": "Avatar upload successful.",
                "avatar_url": profile.avatar_url,
                "thumbnail_url": profile.thumbnail_url,
            },
            status=status.HTTP_200_OK,
        )


class DreamerProfileView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet,
):
    queryset = DreamerProfile.objects.all()
    serializer_class = DreamerProfileSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_serializer_class(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
        ]:
            return DreamerProfileCreateSerializer
        return self.serializer_class

    @extend_schema(
        summary="List Dreamers",
        description="Get a list of Dreamers (Dreamers are not in Users, but some User created a Dream for this person).",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class CountryView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet,
):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [
        IsAdminUser,
    ]

    def get_permissions(self):
        if self.action in [
            "list",
        ]:
            return [AllowAny()]
        if self.action in [
            "create",
        ]:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    @extend_schema(
        summary="List Countries",
        description="Get a list of Countries (Select all countries of registered Users and Dreamers).",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class CityView(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet,
):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    filterset_class = CityFilter
    filter_backends = (filters.DjangoFilterBackend,)
    permission_classes = [
        IsAdminUser,
    ]

    def get_permissions(self):
        if self.action in [
            "list",
        ]:
            return [AllowAny()]
        if self.action in [
            "create",
        ]:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in [
            "update",
            "partial_update",
        ]:
            return CityUpdateSerializer
        return self.serializer_class

    @extend_schema(
        summary="List Cities",
        description="Get a list of Cities (Select all cities of registered Users and Dreamers).",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
