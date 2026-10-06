from django.contrib import admin  # noqa: I001
# Register your models here.
from .models import Profile, Movie, Rating, Review, ContactMessage


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "display_name")
    search_fields = ("user__username", "display_name")


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "year")
    list_filter = ("type", "year")
    search_fields = ("title",)
    ordering = ("title",)


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("user", "movie", "score", "created_at")
    list_filter = ("score",)
    search_fields = ("user__username", "movie__title")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "movie", "created_at")
    search_fields = ("user__username", "movie__title", "comment")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "user", "created_at")
    search_fields = ("subject", "user__username", "message")