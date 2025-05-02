import logging
import stripe

from app.settings import STRIPE_SECRET_KEY, API_PREF, DOMAIN, DEFAULT_FROM_EMAIL
from django.views.generic import TemplateView

logger = logging.getLogger(__name__)  #############

stripe.api_key = STRIPE_SECRET_KEY


class SuccessView(TemplateView):
    template_name = "stripe/success.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["DOMAIN"] = DOMAIN
        context["DEFAULT_FROM_EMAIL"] = DEFAULT_FROM_EMAIL
        return context


class CancelView(TemplateView):
    template_name = "stripe/cancel.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["DOMAIN"] = DOMAIN
        return context


def get_or_create_product_for_dream(dream):
    if not dream.stripe_product_id:
        # Creation of Stripe Product
        product = stripe.Product.create(
            name=f"Donation for {dream.title} (ID: {dream.id})",
            description=f"Support the dream: {dream.title}",
        )
        # Save Product ID to dream
        dream.stripe_product_id = product.id
        dream.save()
    return dream.stripe_product_id


def create_checkout_session(price, domain: str, donation_id):
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price.id,
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url=f"{domain}/{API_PREF}/success/",
            cancel_url=f"{domain}/{API_PREF}/cancel/",
            metadata={
                "donation_id": donation_id  # put ID donation into metadata (for check after payment)
            },
        )
        return checkout_session
    except Exception as e:
        logger.error(f"Error creating payment session: {e}")
        raise
