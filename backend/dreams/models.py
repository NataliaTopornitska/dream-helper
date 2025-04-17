from django.db import models

from users.models import User

from users.models import DreamerProfile


class Category(models.Model):
    name = models.CharField(max_length=65, unique=True)
    description = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]


class Comment(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    dream = models.ForeignKey(
        "Dream", on_delete=models.CASCADE, related_name="comments"
    )
    content = models.TextField(blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.owner} - {self.dream} - {self.content}"

    class Meta:
        ordering = ["-created_at"]


class Dream(models.Model):
    STATUS_DREAM = (
        ("Application", "Application"),
        ("Active", "Active"),
        ("Completed", "Completed"),
    )
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=45)
    to_another = models.BooleanField(default=False)
    dreamer = models.ForeignKey(
        DreamerProfile, on_delete=models.CASCADE, blank=True, null=True
    )
    categories = models.ManyToManyField(
        Category, related_name="dreams", blank=True, default=[]
    )
    content = models.TextField(blank=False, null=False)
    goal = models.DecimalField(decimal_places=2, max_digits=10, default=0)
    photo_url = models.URLField(null=True, blank=True)
    thumbnail_url = models.URLField(null=True, blank=True)  # miniature
    status = models.CharField(
        max_length=12, choices=STATUS_DREAM, default="Application"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    stripe_product_id = models.CharField(
        max_length=255, null=True, blank=True, default=None
    )
    number_views = models.IntegerField(default=0)
    #  dream.donations.all()  -   get donations of dream
    # dream.comments.all()  -   get comments of dream

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.owner}: {self.title} (goal: {str(self.goal)})"


class Donation(models.Model):
    STATUS_DONATION = (
        ("Prepared", "Prepared"),
        ("Paid", "Paid"),
        ("Canceled", "Canceled"),
    )
    dream = models.ForeignKey(Dream, on_delete=models.CASCADE, related_name="donations")
    donator = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True, related_name="donations"
    )  # may be anonymouse donation
    amount = models.DecimalField(decimal_places=2, max_digits=10)
    status = models.CharField(max_length=8, choices=STATUS_DONATION, default="Pending")
    url_payment = models.URLField(max_length=400, null=True, blank=True)
    is_anonymous = models.BooleanField(
        default=False
    )  # if Auth user do anonymous donation
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["dream"]),
        ]

    def __str__(self):
        return self.date.strftime("%Y-%m-%d %H:%M") + " - " + str(self.amount)
