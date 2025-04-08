from django.http import HttpResponse
from rest_framework import generics
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView

from users.models import User, ActivationToken

from rest_framework.permissions import IsAuthenticated

from users.serializers import UserSerializer, UserUpdateSerializer


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


def activate_user(request, pk, activationtoken):
    user = get_object_or_404(User, id=pk)
    if user.is_active:
        return HttpResponse("The user account is already active!")
    token = get_object_or_404(ActivationToken, token=activationtoken)
    if token.user == user:
        user.is_active = True
        # delete token after activation
        token.delete()
    else:
        raise ValueError("Activation token does not belong to this user")
    user.save()
    return HttpResponse("Your Account Has Ben Activated!")


class LoginUserView(ObtainAuthToken):
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES
    serializer_class = AuthTokenSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class LogoutUserView(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        # Delete access token
        Token.objects.filter(user=request.user).delete()
        return Response({"message": "You logout successfully."}, status=200)
