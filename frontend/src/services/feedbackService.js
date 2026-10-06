import { api } from "./api";

export function userKey(user) {
  return user?.id ?? null;
}

export async function getFeedback(movieId) {
  const [ratings, reviews] = await Promise.all([
    api(`/movies/${movieId}/ratings/`),
    api(`/movies/${movieId}/reviews/`),
  ]);

  return { ratings, reviews };
}

export async function saveFeedback(movieId, user, score, comment) {
  if (!user?.id) {
    throw new Error("Please log in to submit feedback.");
  }

  const text = comment.trim();
  const hasScore = score !== "";

  if (!hasScore && !text) {
    throw new Error("Choose a rating or write a review.");
  }

  if (hasScore) {
    await api(`/movies/${movieId}/my-rating/`, {
      method: "PUT",
      body: JSON.stringify({
        score: Number(score),
      }),
    });
  }

  if (text) {
    await api(`/movies/${movieId}/reviews/`, {
      method: "POST",
      body: JSON.stringify({
        comment: text,
      }),
    });
  }
}
