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
    dream = models.ForeignKey("Dream", on_delete=models.CASCADE)
    content = models.TextField(blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.owner} - {self.dream} - {self.content}"

    class Meta:
        ordering = ["-created_at"]


class Donation(models.Model):
    pass


class Dream(models.Model):
    STATUS_DREAM = (
        ("Application", "Application"),
        ("Active", "Active"),
        ("Completed", "Completed"),
    )
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    to_another = models.BooleanField(default=False)
    dreamer = models.ForeignKey(
        DreamerProfile, on_delete=models.CASCADE, blank=True, null=True
    )
    categories = models.ManyToManyField(
        Category, related_name="dreams", blank=True, default=[]
    )
    content = models.TextField()
    goal = models.DecimalField(decimal_places=2, max_digits=10, default=0)
    photo = models.URLField(null=True, blank=True)
    donations = models.ManyToManyField(
        Donation, related_name="dreams", blank=True, default=[]
    )
    status = models.CharField(
        max_length=12, choices=STATUS_DREAM, default="Application"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    stripe_product_id = models.CharField(
        max_length=255, null=True, blank=True, default=None
    )
    comments = models.ManyToManyField(
        Comment, related_name="dreams", blank=True, default=[]
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.owner}: {self.title} (goal: {str(self.goal)})"
