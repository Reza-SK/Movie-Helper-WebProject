from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from .models import Movie, Profile, Rating, Review

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )
    display_name = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = User
        fields = (
            "id", "username", "email",
            "password", "display_name",
        )
        read_only_fields = ("id",)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This Email Used before.Please choose a different one OR login."
            )
        return value

    def validate(self, attrs):
        user = User(
            username=attrs["username"],
            email=attrs["email"],
        )

        try:
            validate_password(attrs["password"], user=user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({
                "password": error.messages,
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        display_name = validated_data.pop("display_name", "")

        user = User.objects.create_user(**validated_data)

        Profile.objects.create(
            user=user,
            display_name=display_name or user.username,
        )

        return user

class MovieSerializer(serializers.ModelSerializer):
    average_rating = serializers.FloatField(
    read_only=True,
    allow_null=True,)
    rating_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Movie
        fields = (
            "id",
            "title",
            "type",
            "description",
            "year",
            "genres",
            "poster",
            "duration_minutes",
            "seasons",
            "created_at",
            "updated_at",
            "average_rating",
            "rating_count",
        )

class RatingSerializer(serializers.ModelSerializer):
    author = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = Rating
        fields = (
            "id", "user_id", "movie_id",
            "author", "score", "created_at",
        )


class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = Review
        fields = (
            "id", "user_id", "movie_id",
            "author", "comment", "created_at",
        )