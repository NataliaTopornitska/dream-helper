from django.http import HttpResponse
from rest_framework import generics
from rest_framework.generics import get_object_or_404


from users.models import User, ActivationToken
from users.serializers import UserSerializer


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


def activate_user(request, pk, activationtoken):
    user = get_object_or_404(User, id=pk)
    token = get_object_or_404(ActivationToken, token=activationtoken)
    if token.user == user:
        user.is_active = True
        # delete token after activation
        token.delete()
    else:
        raise ValueError("Activation token does not belong to this user")
    user.save()
    return HttpResponse("Your Account Has Ben Activated!")
