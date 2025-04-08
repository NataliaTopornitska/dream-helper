from django.db import models

from users.models import User


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


class Dream(models.Model):
    pass
