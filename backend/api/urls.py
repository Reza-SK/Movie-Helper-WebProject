from django.urls import path

from .views import (
    MovieDetailView,
    MovieListView,
    MovieRatingListView,
    MovieReviewListView,
    RegisterView,
)

urlpatterns = [
    path("movies/", MovieListView.as_view(), name="movie-list"),
    path("movies/<int:pk>/", MovieDetailView.as_view(), name="movie-detail"),
    path("movies/<int:pk>/ratings/",MovieRatingListView.as_view(),name="movie-ratings"),
    path("movies/<int:pk>/reviews/",MovieReviewListView.as_view(),name="movie-reviews"),
    path("register/", RegisterView.as_view(), name="register"),
]