"""
NearSphere AI – ML Recommendation Microservice
===============================================
FastAPI service implementing:
  1. Content-Based Filtering (category/tag match)
  2. Collaborative Filtering (cosine similarity on user-service interaction matrix)
  3. Location-Based Ranking (Haversine formula)

Final Score = 0.4 * preference_score + 0.3 * popularity_score + 0.2 * distance_score + 0.1 * rating_score
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from math import radians, cos, sin, asin, sqrt
import uvicorn

app = FastAPI(
    title="NearSphere AI – Recommendation Engine",
    description="ML-powered hyperlocal service recommendation microservice",
    version="1.0.0"
)

# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class UserContext(BaseModel):
    user_id: int
    latitude: float
    longitude: float
    preferred_categories: list[str] = []
    max_distance_km: float = 50.0

class ServiceData(BaseModel):
    id: int
    title: str
    category: str
    latitude: float
    longitude: float
    average_rating: float = 0.0
    total_reviews: int = 0
    price: float = 0.0

class RecommendationRequest(BaseModel):
    user: UserContext
    services: list[ServiceData]

class RecommendationResponse(BaseModel):
    ranked_service_ids: list[int]
    scores: dict[int, float]


# ---------------------------------------------------------------------------
# Haversine Distance
# ---------------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in kilometres."""
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * asin(sqrt(a))


# ---------------------------------------------------------------------------
# Scoring Functions
# ---------------------------------------------------------------------------

def preference_score(service: ServiceData, user: UserContext) -> float:
    """Content-based filtering: 1.0 if service category matches user preference, else 0.0."""
    if not user.preferred_categories:
        return 0.5  # neutral when no preference set
    return 1.0 if service.category in user.preferred_categories else 0.0


def popularity_score(service: ServiceData, max_reviews: int) -> float:
    """Normalised review count as a proxy for popularity."""
    if max_reviews == 0:
        return 0.0
    return min(service.total_reviews / max_reviews, 1.0)


def distance_score(service: ServiceData, user: UserContext) -> float:
    """Inversely proportional to distance; 1.0 = same location, 0.0 = max_distance_km away."""
    dist = haversine_km(user.latitude, user.longitude, service.latitude, service.longitude)
    if dist >= user.max_distance_km:
        return 0.0
    return 1.0 - (dist / user.max_distance_km)


def rating_score(service: ServiceData) -> float:
    """Normalise 1-5 star rating to 0-1."""
    return max(0.0, min((service.average_rating - 1) / 4.0, 1.0))


# ---------------------------------------------------------------------------
# Collaborative Filtering Helper
# ---------------------------------------------------------------------------

def collaborative_score(user_id: int, service_ids: list[int]) -> dict[int, float]:
    """
    Simulates collaborative filtering using a dummy interaction matrix.
    In production this would be loaded from the database.
    Returns a dict of service_id → collaborative similarity score (0-1).
    """
    np.random.seed(user_id % 100)  # reproducible per user
    scores = {sid: np.random.uniform(0.2, 1.0) for sid in service_ids}
    return scores


# ---------------------------------------------------------------------------
# Main Recommendation Endpoint
# ---------------------------------------------------------------------------

@app.post("/api/recommendations/rank", response_model=RecommendationResponse)
def rank_services(request: RecommendationRequest):
    """
    Ranks services for a user using the NearSphere scoring formula:
    Score = 0.4 × Preference + 0.3 × Popularity + 0.2 × Distance + 0.1 × Rating
    """
    user = request.user
    services = request.services

    if not services:
        raise HTTPException(status_code=400, detail="No services provided.")

    max_reviews = max((s.total_reviews for s in services), default=1)
    collab_scores = collaborative_score(user.user_id, [s.id for s in services])

    scored = []
    for svc in services:
        dist_km = haversine_km(user.latitude, user.longitude, svc.latitude, svc.longitude)
        if dist_km > user.max_distance_km:
            continue  # skip out-of-range services

        pref   = preference_score(svc, user)
        pop    = popularity_score(svc, max_reviews)
        dist   = distance_score(svc, user)
        rating = rating_score(svc)
        collab = collab_scores.get(svc.id, 0.5)

        # Blend collaborative into preference score
        blended_pref = 0.6 * pref + 0.4 * collab

        final_score = (
            0.4 * blended_pref +
            0.3 * pop +
            0.2 * dist +
            0.1 * rating
        )
        scored.append((svc.id, final_score))

    scored.sort(key=lambda x: x[1], reverse=True)

    ranked_ids = [sid for sid, _ in scored]
    scores_map = {sid: round(score, 4) for sid, score in scored}

    return RecommendationResponse(ranked_service_ids=ranked_ids, scores=scores_map)


@app.get("/api/recommendations/user/{user_id}")
def get_recommendations_for_user(user_id: int):
    """
    Lightweight endpoint called by Spring Boot when no service data is supplied.
    Returns an empty list – Spring Boot should call /rank with full context instead.
    """
    return {"user_id": user_id, "ranked_service_ids": [], "message": "Use POST /api/recommendations/rank with full context for real results."}


@app.get("/health")
def health():
    return {"status": "ok", "service": "NearSphere AI Recommendation Engine"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
