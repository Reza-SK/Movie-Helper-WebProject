from django.contrib import admin

# Register your models here.
from .models import ContactMessage, Movie, Profile, Rating, Review


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "display_name")
    search_fields = ("user__username", "display_name")


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "display_genres", "year")
    list_filter = ("type", "year")
    search_fields = ("title",)
    ordering = ("title",)

    @admin.display(description="Genres")
    def display_genres(self, obj):
        return ", ".join(obj.genres)


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("user", "movie", "score", "created_at")
    list_filter = ("score",)
    search_fields = ("user__username", "movie__title")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "movie", "comment", "created_at")
    search_fields = ("user__username", "movie__title", "comment")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "user", "created_at")
    search_fields = ("subject", "user__username", "message")