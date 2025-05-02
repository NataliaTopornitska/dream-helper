from django.core.mail import send_mail

# import logging

from django.template.loader import render_to_string

from app.settings import DEFAULT_FROM_EMAIL


# logging.basicConfig(level=logging.DEBUG)

def send_email_with_template(
    subject: str, template_name: str, context: dict, recipient_email: str
):
    #
    print(f"from send_mail  ===================  {template_name=}")
    message = render_to_string(template_name, context)

    send_mail(
        subject,
        "",  # when using template HTML, message : ""
        DEFAULT_FROM_EMAIL,
        [recipient_email],
        html_message=message,  # HTML
    )
