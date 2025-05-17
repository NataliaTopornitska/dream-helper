import os
import random

import stripe
from django.core.exceptions import BadRequest, ObjectDoesNotExist
from django.db.models import Sum, Count, Q
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from .models import Category, Dream, Donation, Comment, Follower
from .pagination import DreamSetPagination
from .serializers import (
    CategorySerializer,
    DreamCreateSerializer,
    DreamBaseSerializer,
    RandomDreamsSerializer,
    DreamPhotoSerializer,
    AddDonationSerializer,
    DonationSerializer,
    DreamUpdateSerializer,
    AddCommentSerializer,
    CommentSerializer,
    DreamDonationsSerializer,
    DreamCommentsSerializer,
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

from app.settings import (
    BUCKET_NAME,
    STORAGE_HOST,
    STORAGE_PORT,
    RESIZE_PHOTO_DREAM_WIDTH,
    RESIZE_PHOTO_DREAM_HEIGHT,
    DOMAIN,
    STRIPE_WEBHOOK_SECRET,
    DEFAULT_FROM_EMAIL,
    API_PREF,
    ADMIN_EMAIL,
)

from utils.stripe import (
    get_or_create_product_for_dream,
    create_checkout_session,
)

from django_filters import rest_framework as filters
from .filters import DreamFilter


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

    def get_permissions(self):
        if self.action in (
            "create",
        ):
            return [IsAuthenticated()]
        if self.action in (
            "list",
        ):
            return [AllowAny()]
        return [IsAdminUser()]



class DreamViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet,
):
    queryset = Dream.objects.all().annotate(
        number_donations=Count("donations", filter=Q(donations__status="Paid")),
        total_amount_donations=Sum(
            "donations__amount", filter=Q(donations__status="Paid")
        ),
        number_comments=Count("comments"),
    )
    serializer_class = DreamBaseSerializer
    permission_classes = [IsAuthenticated()]
    filterset_class = DreamFilter
    filter_backends = (filters.DjangoFilterBackend,)
    pagination_class = DreamSetPagination

    def get_queryset(self):
        queryset = self.queryset
        # only admins can see all of dreams
        if self.action == "list" and not self.request.user.is_staff:
            queryset = queryset.filter(status__in=["Active", "Completed"])

        return queryset

    def get_permissions(self):
        if self.action in (
            "update",
            "partial_update",
        ):  # update only Admin
            return [IsAdminUser()]
        if self.action in ("create", "upload_dream_photo"):  # create only AuthUser
            return [IsAuthenticated()]
        return [AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        # every time, if watch detail of Dream, number_views +1
        instance = self.get_object()
        instance.number_views += 1
        instance.save(update_fields=["number_views"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        user = request.user

        if not user.is_active:
            return Response(
                {
                    "error": "We are very sorry, but your account is not activated. First you need to activate the link from the letter you received to your email."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        dream = self.serializer_class.Meta.model.objects.get(pk=response.data["id"])

        context = {
            "owner": user,
            "application": dream.title,
        }

        send_email_with_template(
            subject="✨ Your Dream Has Been Added to DreamsHelper!",
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
        # if self.action == "list":
        #     return DreamBaseSerializer
        # if self.action == "retrieve":
        #     return DreamBaseSerializer
        if self.action == "create":
            return DreamCreateSerializer
        if self.action == "get_random_dreams":
            return RandomDreamsSerializer
        if self.action == "upload_dream_photo":
            return DreamPhotoSerializer
        if self.action in ("update", "partial_update"):
            return DreamUpdateSerializer
        if self.action == "make_donation":
            return AddDonationSerializer
        if self.action == "add_comment":
            return AddCommentSerializer
        return DreamBaseSerializer

    @action(
        methods=["get"],
        detail=False,
        url_path="get_random_dreams",
    )
    def get_random_dreams(self, request):
        active_dreams = Dream.objects.filter(status="Active")
        numbers = settings.RANDOM_DREAMS_HOME
        numbers = min(int(numbers), len(active_dreams))
        ids = active_dreams.values_list("id", flat=True)
        random_ids = random.sample(list(ids), numbers)  # get number random ID
        queryset = active_dreams.filter(id__in=random_ids).order_by(
            "?"
        )  #  without ordering

        return Response(
            RandomDreamsSerializer(queryset, many=True).data,
            status=status.HTTP_200_OK,
        )

    @action(
        methods=["post"],
        detail=True,
        permission_classes=[IsAuthenticated],
        url_path="upload_dream_photo",
    )
    def upload_dream_photo(self, request, pk=None):
        dream = self.get_object()

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
        upload_image_and_miniature_to_storage(
            file,
            dream,
            "dreams",
            "photo_url",
            int(RESIZE_PHOTO_DREAM_WIDTH),
            int(RESIZE_PHOTO_DREAM_HEIGHT),
        )

        return Response(
            {
                "message": "File upload successful.",
                "photo_url": dream.photo_url,
                "thumbnail_url": dream.thumbnail_url,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        methods=["post"],
        detail=True,
        url_path="make_donation",
    )
    def make_donation(self, request, pk=None):
        print(f"REQUEST DATA: {request.data}")
        amount = request.data.get("amount")
        print(f"Received amount: {amount}")

        domain = DOMAIN

        # getting amount
        other_amount = request.data.get("your_amount", None)
        if other_amount:
            try:
                amount = float(other_amount)
            except ValueError:
                return Response({"error": "Invalid amount"}, status=400)
        else:
            amount = float(request.data.get("amount", None))
            if not amount:
                return Response({"error": "Amount is required"}, status=400)

        # get dream
        dream = Dream.objects.get(pk=pk)

        try:
            # get or create (if is the first) Product Stripe for dream
            stripe_product_id = get_or_create_product_for_dream(dream)

            # Create object Donation with status Pending
            new_donation = Donation.objects.create(dream=dream, amount=amount)

            # create Price (dynamic price)
            price = stripe.Price.create(
                unit_amount=int(amount * 100),  # in cents
                currency="usd",
                product=stripe_product_id,
            )

            # create Stripe payment session
            checkout_session = create_checkout_session(
                price, domain, donation_id=new_donation.id
            )
            print(f"Stripe Session metadata: {checkout_session.metadata}")

            # Create object Donation with status Pending
            new_donation.url_payment = checkout_session.url

            user = request.user
            print(f"{user=}")
            print(f"{user.is_authenticated=}")

            if user.is_authenticated:
                new_donation.donator = user  # if user is authenticated
            else:
                new_donation.donator = None
                new_donation.is_anonymous = True

            is_anonymous = request.data.get("is_anonymous", None)

            if is_anonymous:
                new_donation.is_anonymous = True

            new_donation.save()
            print(f"{new_donation=}")

            follow = request.data.get("follow", None)
            if follow:
                # this user follow to this dream
                follower = Follower.objects.create(dream=dream, user=user)
                follower.save()

            # add donation in dream  (any status)
            dream.donations.add(new_donation)
            dream.save()

            return redirect(checkout_session.url)

        except Dream.DoesNotExist:
            return Response({"error": "Dream not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(
        methods=["post"],
        detail=True,
        url_path="add_comment",
    )
    def add_comment(self, request, pk=None):
        owner = request.user
        if not owner.is_authenticated:
            raise PermissionDenied(detail="You must be logged in to add a comment.")
        dream = Dream.objects.get(pk=pk)
        content = request.data.get("content")
        if not content:
            return Response({"error": "Content is required"}, status=400)

        new_comment = Comment(content=content, owner=owner, dream=dream)
        new_comment.save()

        return Response(
            {"detail": "Comment added successfully."}, status=status.HTTP_200_OK
        )

    @action(
        methods=["get"],
        detail=True,
        url_path="all_donations",
    )
    def all_donations(self, request, pk=None):
        try:
            dream = Dream.objects.get(pk=pk)
        except ObjectDoesNotExist:
            return Response({"detail": "Dream with this ID not found."}, status=404)

        donations = dream.donations.all()
        donations = dream.donations.filter(status="Paid")
        if not donations:
            return Response({"message": "No donations yet."}, status=204)

        serialized_data = DreamDonationsSerializer(donations, many=True)
        return Response(serialized_data.data, status=200)

    @action(
        methods=["get"],
        detail=True,
        url_path="all_comments",
    )
    def all_comments(self, request, pk=None):
        try:
            dream = Dream.objects.get(pk=pk)
        except ObjectDoesNotExist:
            return Response({"detail": "Dream with this ID not found."}, status=404)

        comments = dream.comments.all()
        if not comments:
            return Response({"message": "No comments yet."}, status=204)

        serialized_data = DreamCommentsSerializer(comments, many=True)
        return Response(serialized_data.data, status=200)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META["HTTP_STRIPE_SIGNATURE"]
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return HttpResponse(status=400)

    # Handle the checkout.session.completed event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        customer_email = session["customer_details"]["email"]
        customer_name = session["customer_details"]["name"]
        line_items = stripe.checkout.Session.list_line_items(session["id"])

        print(f"{session['customer_details']=}")
        # stripe_price_id = line_items["data"][0]["price"]["id"]
        stripe_product_id = line_items["data"][0]["price"]["product"]
        amount_total = line_items["data"][0]["amount_total"] / 100
        description = line_items["data"][0]["description"]
        # Get donation_id from metadata
        donation_id = session["metadata"]["donation_id"]

        # print("stripe_price_id=", stripe_price_id)
        print("customer_email=", customer_email)
        print("customer_name=", customer_name)

        print("stripe_product_id=", stripe_product_id)
        print("amount_total=", amount_total)
        print("description=", description)
        print("donation_id=", donation_id)

        dream = Dream.objects.filter(stripe_product_id=stripe_product_id).first()
        dream_link = f"{DOMAIN}/{API_PREF}/dreamhelper/dreams/{dream.id}"
        # send a thank_you EMAIL to a donator
        if customer_email:
            context = {
                "donator": customer_name,
                "description": description,
                "dream_link": dream_link,
            }

            send_email_with_template(
                subject="🎁 Confirmation of Your Donation",
                template_name=os.path.join(
                    settings.BASE_DIR,
                    "templates",
                    "email",
                    "confirm_donation_email.html",
                ),
                context=context,
                recipient_email=customer_email,
            )
        # change donation status to Paid
        donation = Donation.objects.get(id=donation_id)
        donation.status = "Paid"
        donation.save()

        # Check, if Donation Completed -  send EMAIL to owner of Dream, status=Complete
        # dream = Dream.objects.filter(stripe_product_id=stripe_product_id).first()
        sum_donations = Donation.objects.filter(
            dream_id=dream.id, status="Paid"
        ).aggregate(Sum("amount"))["amount__sum"]
        print(f"{sum_donations=}")
        print(f"{dream.goal=}")
        print(f"{sum_donations >= dream.goal=}")
        if sum_donations >= dream.goal:
            dream.status = "Completed"
            dream.completed_at = timezone.now()
            dream.save()
            #  send Email dream.owner   and  admin of web
            context = {
                "owner": dream.owner,
                "dream": dream.title,
                "amount": sum_donations,
                "dream_link": dream_link,
            }

            send_email_with_template(
                subject=f"💰 Your Dream '{dream.title}' Has Been Fully Funded! 🎉",
                template_name=os.path.join(
                    settings.BASE_DIR,
                    "templates",
                    "email",
                    "dream_completed.html",
                ),
                context=context,
                recipient_email=dream.owner.email,
            )
            send_email_with_template(
                subject=f"For ADMIN DreamHelper: dream ID={dream.id} Has Been Completed!",
                template_name=os.path.join(
                    settings.BASE_DIR,
                    "templates",
                    "email",
                    "dream_completed.html",
                ),
                context=context,
                recipient_email=ADMIN_EMAIL,
            )

    return HttpResponse(status=200)


class DonationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet,
):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer


class DreamStatisticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        total_dreams = Dream.objects.count()
        people = (
            User.objects.count() + DreamerProfile.objects.count()
        )  #  later may be only active users

        queryset = Donation.objects.filter(status="Paid").all()
        total_donations = queryset.aggregate(total_sum=Sum("amount"))["total_sum"] or 0

        queryset = queryset.filter(is_anonymous=True)
        anonymous_donations = (
            queryset.aggregate(total_sum=Sum("amount"))["total_sum"] or 0
        )

        data = {
            "total_dreams": total_dreams,
            "people": people,
            "anonymous_donations": anonymous_donations,
            "total_donations": total_donations,
        }

        return Response(data)


class CommentViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    GenericViewSet,
):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAdminUser]
