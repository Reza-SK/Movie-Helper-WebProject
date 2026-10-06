# from django.shortcuts import render

# Create your views here.
from django.db.models import Avg, Count, F
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .models import Movie, Rating, Review
from .serializers import (
    MovieSerializer,
    RatingSerializer,
    RegisterSerializer,
    ReviewSerializer,
)


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    authentication_classes = ()

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


class MovieReviewListView(ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        movie = get_object_or_404(Movie, pk=self.kwargs["pk"])

        return (
            Review.objects
            .filter(movie=movie)
            .select_related("user")
            .order_by("-created_at", "-id")
        )