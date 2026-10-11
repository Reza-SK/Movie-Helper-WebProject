# from django.shortcuts import render

# Create your views here.
import json

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.db.models import Avg, Count, F
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_GET, require_POST
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import (
    AllowAny,
    BasePermission,
    IsAdminUser,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response
from rest_framework.views import APIView, PermissionDenied

from .models import ContactMessage, Movie, Profile, Rating, Review
from .serializers import (
    AdminUserCreateSerializer,
    AdminUserSerializer,
    ContactMessageSerializer,
    MovieAdminSerializer,
    MovieSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileSerializer,
    RatingInputSerializer,
    RatingSerializer,
    RegisterSerializer,
    ReviewSerializer,
)


@require_GET
def csrf_token_view(request):
    return JsonResponse({
        "csrfToken": get_token(request),
    })


@require_POST
@csrf_protect
def login_view(request):
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse(
            {"detail": "Invalid JSON data."},
            status=400,
        )

    if not isinstance(data, dict):
        return JsonResponse({"detail": "Invalid data format."}, status=400)

    username = data.get("username")
    password = data.get("password")

    if not isinstance(username, str) or not isinstance(password, str):
        return JsonResponse(
            {"detail": "Enter Username and Password."},
            status=400,
        )

    user = authenticate(
        request,
        username=username.strip(),
        password=password,
    )

    if user is None:
        return JsonResponse(
            {"detail": "Invalid username or password."},
            status=401,
        )

    login(request, user)

    return JsonResponse({
        "id": user.id,
        "username": user.username,
        "role": "admin" if user.is_staff else "user",
    })
@require_POST
@csrf_protect
def logout_view(request):
    logout(request)

    return JsonResponse({
        "detail": "You have been logged out successfully.",
    })

@require_GET
def current_user_view(request):
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({
            "isAuthenticated": False,
            "user": None,
        })

    return JsonResponse({
        "isAuthenticated": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": "admin" if user.is_staff else "user",
        },
    })

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    authentication_classes = ()

class ProfileView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(
            user=self.request.user,
            defaults={
                "display_name": self.request.user.username,
            },
        )
        return profile

class ProfileHistoryView(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        ratings = (
            Rating.objects
            .filter(user=request.user)
            .select_related("user", "movie")
        )

        reviews = (
            Review.objects
            .filter(user=request.user)
            .select_related("user", "movie")
        )

        history = []

        for rating in ratings:
            history.append({
                **RatingSerializer(rating).data,
                "type": "rating",
                "movie_title": rating.movie.title,
            })

        for review in reviews:
            history.append({
                **ReviewSerializer(review).data,
                "type": "review",
                "movie_title": review.movie.title,
            })

        history.sort(
            key=lambda item: item["created_at"],
            reverse=True,
        )

        return Response(history)

class MovieListView(ListAPIView):
    serializer_class = MovieSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        movies = Movie.objects.annotate(
            average_rating=Avg("ratings__score"),
            rating_count=Count("ratings"),
        )

        year = self.request.query_params.get("year")
        genre = self.request.query_params.get("genre")
        ordering = self.request.query_params.get("ordering", "id")

        if year:
            try:
                year = int(year)
            except ValueError:
                raise ValidationError({"year": "Must be a valid number"})

            movies = movies.filter(year=year)

        if genre:
            matching_ids = [
                movie.id
                for movie in movies
                if genre in movie.genres
            ]
            movies = movies.filter(id__in=matching_ids)

        if ordering == "-average_rating":
            return movies.order_by(
                F("average_rating").desc(nulls_last=True),
                "id",
            )

        if ordering == "average_rating":
            return movies.order_by(
                F("average_rating").asc(nulls_last=True),
                "id",
            )

        if ordering != "id":
            raise ValidationError({"ordering": "Sorting is only allowed by 'id' or 'average_rating'"})

        return movies.order_by("id")
    
class MovieDetailView(RetrieveAPIView):
    queryset = Movie.objects.annotate(
    average_rating=Avg("ratings__score"),
    rating_count=Count("ratings"),).order_by("id")
    serializer_class = MovieSerializer
    permission_classes = (AllowAny,)
    
    
class MovieRatingListView(ListAPIView):
    serializer_class = RatingSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        movie = get_object_or_404(Movie, pk=self.kwargs["pk"])

        return (
            Rating.objects
            .filter(movie=movie)
            .select_related("user")
            .order_by("-created_at", "-id")
        )

class MovieReviewListView(ListCreateAPIView):
    serializer_class = ReviewSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        movie = get_object_or_404(Movie, pk=self.kwargs["pk"])

        return (
            Review.objects
            .filter(movie=movie)
            .select_related("user")
            .order_by("-created_at", "-id")
        )


    def perform_create(self, serializer):
        movie = get_object_or_404(Movie, pk=self.kwargs["pk"])
        serializer.save(user=self.request.user, movie=movie)


class MyRatingView(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        movie = get_object_or_404(Movie, pk=pk)

        rating = Rating.objects.filter(
            user=request.user,
            movie=movie,
        ).first()

        if rating is None:
            return Response({"rating": None})

        return Response({
            "rating": RatingSerializer(rating).data,
        })

    def put(self, request, pk):
        movie = get_object_or_404(Movie, pk=pk)

        serializer = RatingInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        rating, created = Rating.objects.update_or_create(
            user=request.user,
            movie=movie,
            defaults={
                "score": serializer.validated_data["score"],
            },
        )

        return Response(
            RatingSerializer(rating).data,
            status=201 if created else 200,
        )

    def perform_create(self, serializer):
        movie = get_object_or_404(Movie, pk=self.kwargs["pk"])

        serializer.save(
            user=self.request.user,
            movie=movie,
        )
        
class IsRegularUser(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        return (
            user.is_authenticated
            and user.is_active
            and not user.is_staff
        )


class ContactCreateView(CreateAPIView):
    serializer_class = ContactMessageSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsRegularUser,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AdminContactListView(ListAPIView):
    serializer_class = ContactMessageSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAdminUser,)

    queryset = (
        ContactMessage.objects
        .select_related("user")
        .order_by("-created_at", "-id")
    )
    
class AdminFeedbackPagination(PageNumberPagination):
    page_size = 20


class AdminRatingListView(ListAPIView):
    serializer_class = RatingSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAdminUser,)
    pagination_class = AdminFeedbackPagination

    queryset = (
        Rating.objects
        .select_related("user", "movie")
        .order_by("-created_at", "-id")
    )


class AdminReviewListView(ListAPIView):
    serializer_class = ReviewSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAdminUser,)
    pagination_class = AdminFeedbackPagination

    queryset = (
        Review.objects
        .select_related("user", "movie")
        .order_by("-created_at", "-id")
    )
    
class SiteReportView(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAdminUser,)

    def get(self, request):
        User = get_user_model()

        active_users = User.objects.filter(
            is_active=True,
        ).count()

        ranked = (
            Movie.objects
            .annotate(
                average_rating=Avg("ratings__score"),
                rating_count=Count("ratings"),
            )
            .filter(rating_count__gt=0)
            .order_by("-average_rating", "id")
        )

        top_movies = ranked.filter(type="movie")[:5]
        top_series = ranked.filter(type="series")[:5]

        return Response({
            "active_users": active_users,
            "top_movies": MovieSerializer(
                top_movies,
                many=True,
            ).data,
            "top_series": MovieSerializer(
                top_series,
                many=True,
            ).data,
        })
        
class AdminMovieListView(ListCreateAPIView):
    queryset = Movie.objects.all().order_by("-id")
    serializer_class = MovieAdminSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAdminUser,)


class AdminMovieDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieAdminSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAdminUser,)
    

class AdminUserListView(ListCreateAPIView):
    queryset = get_user_model().objects.all().order_by("id")
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAdminUser,)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminUserCreateSerializer

        return AdminUserSerializer


class AdminUserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = AdminUserSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAdminUser,)

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise PermissionDenied(
                "Can't delete your own account."
            )

        instance.delete()
        
class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = PasswordResetRequestSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        User = get_user_model()

        users = User.objects.filter(
            email__iexact=email,
            is_active=True,
        )

        for user in users:
            if not user.has_usable_password():
                continue

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_url = (
                f"{settings.FRONTEND_URL.rstrip('/')}"
                f"/reset-password?uid={uid}&token={token}"
            )

            send_mail(
                subject="Reset your Movie Helper password",
                message=f"Use this link to reset your password:\n{reset_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response({
            "detail": (
                "If an eligible account exists, "
                "a password reset link has been sent."
            ),
        })
        
class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        User = get_user_model()

        try:
            user_id = force_str(
                urlsafe_base64_decode(data["uid"])
            )
            user = User.objects.get(
                pk=user_id,
                is_active=True,
            )
        except (
            ValueError,
            TypeError,
            OverflowError,
            UnicodeDecodeError,
            User.DoesNotExist,
        ):
            raise ValidationError({
                "detail": "Invalid or expired reset link."
            })

        if not user.has_usable_password() or not (
            default_token_generator.check_token(
                user,
                data["token"],
            )
        ):
            raise ValidationError({
                "detail": "Invalid or expired reset link."
            })

        try:
            validate_password(data["password"], user=user)
        except DjangoValidationError as error:
            raise ValidationError({
                "password": error.messages,
            })

        user.set_password(data["password"])
        user.save(update_fields=["password"])

        return Response({
            "detail": "Password updated. Please log in."
        })
