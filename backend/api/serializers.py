from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from .models import ContactMessage, Movie, Profile, Rating, Review

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

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = Profile
        fields = ("username", "email", "display_name", "bio")

    def validate_email(self, value):
        duplicate = User.objects.filter(
            email__iexact=value,
        ).exclude(pk=self.instance.user_id)

        if duplicate.exists():
            raise serializers.ValidationError(
                "Email registered before.Please choose a different one OR login."
            )

        return value

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        if "email" in user_data:
            instance.user.email = user_data["email"]
            instance.user.save(update_fields=["email"])

        return super().update(instance, validated_data)

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
    movie_title = serializers.CharField(
        source="movie.title",
        read_only=True,
    )

    class Meta:
        model = Rating
        fields = (
            "id", "user_id", "movie_id",
            "author", "score", "created_at","movie_title",
        )

class RatingInputSerializer(serializers.Serializer):
    score = serializers.IntegerField(
        min_value=1,
        max_value=10,
    )

class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.CharField(
        source="user.username",
        read_only=True,
    )
    movie_title = serializers.CharField(
        source="movie.title",
        read_only=True,
    )

    class Meta:
        model = Review
        read_only_fields = (
            "id", "user_id", "movie_id", "author", "created_at",
        )
        fields = (
            "id", "user_id", "movie_id",
            "author", "comment", "created_at","movie_title",
        )

class ContactMessageSerializer(serializers.ModelSerializer):
    author = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = ContactMessage
        fields = (
            "id", "user_id", "author",
            "subject", "message", "created_at",
        )
        read_only_fields = (
            "id", "user_id", "author", "created_at",
        )
        
class MovieAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = (
            "id", "title", "type", "description", "year",
            "genres", "poster", "duration_minutes", "seasons",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_genres(self, value):
        if not isinstance(value, list) or not value:
            raise serializers.ValidationError(
                "Select at least one genre for the movie."
            )

        if any(
            not isinstance(genre, str) or not genre.strip()
            for genre in value
        ):
            raise serializers.ValidationError(
                "Genres must be non-empty strings."
            )

        return list(dict.fromkeys(
            genre.strip() for genre in value
        ))

    def validate(self, attrs):
        def get_value(name):
            if name in attrs:
                return attrs[name]
            return getattr(self.instance, name, None)

        media_type = get_value("type")
        duration = get_value("duration_minutes")
        seasons = get_value("seasons")

        if media_type == "movie":
            if duration is None or duration < 1:
                raise serializers.ValidationError({
                    "duration_minutes": "Duration must be a positive integer for movies."
                })

            if seasons is not None:
                raise serializers.ValidationError({
                    "seasons": "For movies, seasons should be empty."
                })

        elif media_type == "series":
            if seasons is None or seasons < 1:
                raise serializers.ValidationError({
                    "seasons": "Number of seasons must be a positive integer for series."
                })

            if duration is not None:
                raise serializers.ValidationError({
                    "duration_minutes": "For series, duration_minutes should be empty."
                })

        return attrs
    
class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    
    display_name = serializers.CharField(
        source="profile.display_name",
        max_length=100,
        required=False,
        allow_blank=True,
        default="",
    )
    
    bio = serializers.CharField(
        source="profile.bio",
        max_length=500,
        required=False,
        allow_blank=True,
        default="",
    )

    class Meta:
        model = User
        fields = (
            "id", "username", "email",
            "is_active", "is_staff", "role", "date_joined","display_name","bio",
        )
        read_only_fields = ("id", "role", "date_joined")

    def get_role(self, user):
        return "admin" if user.is_staff else "user"

    def validate_email(self, value):
        duplicate = User.objects.filter(email__iexact=value)
        
        if self.instance is not None:
            duplicate = duplicate.exclude(pk=self.instance.pk)

        if duplicate.exists():
            raise serializers.ValidationError(
                "This Email Used before.Please choose a different one OR login."
            )

        return value

    def validate(self, attrs):
        actor = self.context["request"].user
        
        if self.instance is not None and self.instance.pk == actor.pk:
            if attrs.get("is_active") is False:
                raise serializers.ValidationError(
                    "Can't deactivate your own account."
                )

            if attrs.get("is_staff") is False:
                raise serializers.ValidationError(
                    "Can't remove your own admin privileges."
                )

        return attrs
    
    @transaction.atomic
    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})

        instance = super().update(instance, validated_data)

        if profile_data:
            profile, _ = Profile.objects.get_or_create(
                user=instance,
            )

            for field, value in profile_data.items():
                setattr(profile, field, value)

            profile.save()

        return instance

class AdminUserCreateSerializer(AdminUserSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )


    class Meta(AdminUserSerializer.Meta):
        fields = AdminUserSerializer.Meta.fields + ("password",)

    def validate(self, attrs):
        attrs = super().validate(attrs)

        candidate = User(
            username=attrs["username"],
            email=attrs["email"],
        )

        try:
            validate_password(attrs["password"], user=candidate)
        except DjangoValidationError as error:
            raise serializers.ValidationError({
                "password": error.messages,
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        profile_data = validated_data.pop("profile", {})

        user = User.objects.create_user(**validated_data)

        Profile.objects.create(
            user=user,
            display_name=(
                profile_data.get("display_name") or user.username
            ),
            bio=profile_data.get("bio", ""),
        )

        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )