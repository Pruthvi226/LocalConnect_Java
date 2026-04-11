import os
import time
import json
import asyncio
import logging
from typing import List, Dict, Optional, Any
from math import radians, cos, sin, asin, sqrt

import uvicorn
import httpx
import redis.asyncio as redis
import google.generativeai as genai
from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load configurations
load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NearSphere-AI")

# ---------------------------------------------------------------------------
# Constants & Config
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
JAVA_BACKEND_URL = os.getenv("JAVA_BACKEND_URL", "http://localhost:8080/api")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
CACHE_TTL = int(os.getenv("CACHE_TTL", 600))
AI_TIMEOUT = float(os.getenv("AI_TIMEOUT_SECONDS", 2.0))

# Initialize Clients
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

app = FastAPI(
    title="ProxiSense Smart AI",
    description="Optimized AI Assistant & Recommendation Engine",
    version="2.0.0"
)

# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class UserContext(BaseModel):
    user_id: Optional[int] = None
    latitude: float
    longitude: float
    query: str

class AiServiceItem(BaseModel):
    id: int
    title: str
    category: str
    averageRating: float
    totalReviews: int
    price: float
    location: str
    latitude: float
    longitude: float
    providerName: str
    providerTrustScore: float
    isAvailableNow: bool

class ChatResponse(BaseModel):
    message: str
    intent: str
    recommendations: List[Dict[str, Any]] = []
    latency_ms: float

# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * asin(sqrt(a))

def calculate_score(svc: AiServiceItem, user_lat: float, user_lon: float) -> float:
    dist = haversine_km(user_lat, user_lon, svc.latitude, svc.longitude)
    dist_score = max(0.0, 1.0 - (dist / 50.0))  # Normalize to 50km
    rating_score = (svc.averageRating / 5.0) if svc.averageRating > 0 else 0.5
    trust_score = (svc.providerTrustScore / 100.0)
    
    # Weightage: 50% Rating/Trust, 30% Distance, 20% Price (inverse)
    final_score = (rating_score * 0.25 + trust_score * 0.25) + (dist_score * 0.3) + 0.2
    return round(final_score, 4)

# ---------------------------------------------------------------------------
# Core Logic
# ---------------------------------------------------------------------------

async def get_all_services() -> List[AiServiceItem]:
    """Fetch lightweight summary from Java backend with caching."""
    cache_key = "java_services_summary"
    cached = await redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        return [AiServiceItem(**item) for item in data]
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(f"{JAVA_BACKEND_URL}/services/ai/search")
            if resp.status_code == 200:
                data = resp.json()
                await redis_client.setex(cache_key, 60, json.dumps(data)) # Short cache for data
                return [AiServiceItem(**item) for item in data]
        except Exception as e:
            logger.error(f"Java Backend Error: {e}")
    return []

KEYWORD_SHORTCUTS = [
    "plumber", "electrician", "cleaning", "ac repair", "mechanic", "carpenter",
    "plumbing", "clean", "ac", "repair", "tutor", "math", "physics", "pest", 
    "garden", "moving", "fix", "wash", "maintenance", "installation"
]

async def detect_intent_and_rank(query: str, services: List[AiServiceItem], user_lat: float, user_lon: float) -> ChatResponse:
    start_time = time.time()
    
    lower_query = query.lower().strip()
    
    # Check for direct keyword shortcut
    is_keyword = any(kw in lower_query for kw in KEYWORD_SHORTCUTS)
    if len(lower_query.split()) <= 2 and is_keyword:
        logger.info(f"Bypassing AI for keyword: {lower_query}")
        ranked = sorted(
            [s for s in services if s.category.lower() in lower_query or s.title.lower() in lower_query],
            key=lambda x: calculate_score(x, user_lat, user_lon),
            reverse=True
        )[:5]
        
        return ChatResponse(
            message=f"I found the best local experts for {lower_query} near your location.",
            intent="SEARCH_SERVICE",
            recommendations=[s.model_dump() for s in ranked],
            latency_ms=(time.time() - start_time) * 1000
        )

    # AI Path
    try:
        # Prompt for Intent Detection & Filter
        system_prompt = f"""
        You are Proxisense AI, a smart booking assistant. 
        Input Query: "{query}"
        
        Available Categories: {list(set(s.category for s in services))}
        
        Task:
        1. Detect intent: SEARCH_SERVICE, BOOK_SERVICE, or GENERAL.
        2. Extract key filters (budget, urgency).
        3. Respond with a helpful, short message.
        
        Output format (JSON only):
        {{"intent": "...", "message": "...", "filters": {{"category": "...", "budget": null}}}}
        """
        
        # Parallel Execution: AI Call + Logic
        ai_task = asyncio.create_task(asyncio.to_thread(model.generate_content, system_prompt))
        
        # We can do other things here if needed
        
        response = await asyncio.wait_for(ai_task, timeout=AI_TIMEOUT)
        ai_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())
        
        intent = ai_data.get("intent", "GENERAL")
        message = ai_data.get("message", "How can I help you today?")
        target_category = ai_data.get("filters", {}).get("category")

        # Smart Ranking
        filtered = services
        if target_category and target_category != "null":
            filtered = [s for s in services if s.category.lower() == target_category.lower()]
            
        ranked = sorted(
            filtered,
            key=lambda x: calculate_score(x, user_lat, user_lon),
            reverse=True
        )[:5]

        return ChatResponse(
            message=message,
            intent=intent,
            recommendations=[s.model_dump() for s in ranked],
            latency_ms=(time.time() - start_time) * 1000
        )
        
    except Exception as e:
        logger.error(f"AI Failure: {e}")
        # Fallback to pure search
        ranked = sorted(services, key=lambda x: calculate_score(x, user_lat, user_lon), reverse=True)[:5]
        return ChatResponse(
            message="I'm having trouble connecting to my AI brain, but here are the best services nearby right now.",
            intent="FALLBACK",
            recommendations=[s.model_dump() for s in ranked],
            latency_ms=(time.time() - start_time) * 1000
        )

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"Path: {request.url.path} Duration: {duration:.4f}s")
    return response

@app.post("/api/ai/chat", response_model=ChatResponse)
async def ai_chat(context: UserContext):
    # Check Cache
    cache_key = f"chat_cache:{context.query}:{context.latitude}:{context.longitude}"
    cached = await redis_client.get(cache_key)
    if cached:
        logger.info("Serving from cache")
        res = ChatResponse(**json.loads(cached))
        return res

    services = await get_all_services()
    if not services:
        return ChatResponse(
            message="The service network is currently offline. Please try again in a few minutes.",
            intent="ERROR",
            latency_ms=0
        )
    
    response = await detect_intent_and_rank(context.query, services, context.latitude, context.longitude)
    
    # Save to Cache if successful
    if response.intent != "ERROR":
        await redis_client.setex(cache_key, CACHE_TTL, json.dumps(response.model_dump()))
        
    return response

@app.get("/health")
async def health():
    return {"status": "ok", "gemini": bool(GEMINI_API_KEY)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
