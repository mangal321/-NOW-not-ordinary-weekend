from datetime import datetime, timedelta, timezone
from hashlib import pbkdf2_hmac, sha256
import hmac
import json
import os
import secrets
import time
from pathlib import Path
from typing import Any, Optional

from anthropic import AsyncAnthropic
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()
app = FastAPI(title="NOW API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
SECRET = os.getenv("JWT_SECRET", "local-development-secret")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
claude = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"]) if os.getenv("ANTHROPIC_API_KEY") else None

# --- Persistence: MongoDB when reachable (durable across restarts), else a JSON file. ---
DB_PATH = Path(os.getenv("DB_PATH", str(Path(__file__).resolve().parent / "now_db.json")))
users: dict[str, dict[str, Any]] = {}
trips: dict[str, dict[str, Any]] = {}
expenses: dict[str, dict[str, Any]] = {}
sessions: dict[str, list[dict[str, str]]] = {}

_mongo_collection: Any = None
try:  # Optional Mongo backing — the app works fine without it.
    if os.getenv("MONGO_URL"):
        from pymongo import MongoClient

        _client = MongoClient(os.getenv("MONGO_URL"), serverSelectionTimeoutMS=2500, tz_aware=True)
        _client.admin.command("ping")
        _mongo_collection = _client[os.getenv("DB_NAME", "now")]["state"]
        print("Storage: MongoDB connected (durable).")
except Exception as error:
    _mongo_collection = None
    print(f"Storage: MongoDB unavailable ({error.__class__.__name__}); using JSON file {DB_PATH.name}.")


def _state() -> dict[str, Any]:
    return {"users": users, "trips": trips, "expenses": expenses, "sessions": sessions}


def load_db() -> None:
    if _mongo_collection is not None:
        try:
            document = _mongo_collection.find_one({"_id": "state"})
            if document and "data" in document:
                payload = document["data"]
                users.update(payload.get("users", {}))
                trips.update(payload.get("trips", {}))
                expenses.update(payload.get("expenses", {}))
                sessions.update(payload.get("sessions", {}))
                return
        except Exception as error:
            print(f"Warning: Mongo load failed ({error.__class__.__name__}); trying JSON file.")
    try:
        if DB_PATH.exists():
            data = json.loads(DB_PATH.read_text())
            users.update(data.get("users", {}))
            trips.update(data.get("trips", {}))
            expenses.update(data.get("expenses", {}))
            sessions.update(data.get("sessions", {}))
    except Exception as error:
        print(f"Warning: could not load {DB_PATH}: {error}. Starting with empty stores.")


def save_db() -> None:
    payload = _state()
    if _mongo_collection is not None:
        try:
            _mongo_collection.update_one({"_id": "state"}, {"$set": {"data": payload}}, upsert=True)
            return
        except Exception as error:
            print(f"Warning: Mongo save failed ({error.__class__.__name__}); writing JSON file instead.")
    try:
        tmp = DB_PATH.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload))
        tmp.replace(DB_PATH)
    except Exception as error:
        print(f"Warning: could not save {DB_PATH}: {error}")


load_db()

# --- Passwords: salted PBKDF2-SHA256 (260k iterations) + legacy hash migration. ---
PBKDF2_ITERATIONS = 260_000


def _legacy_digest(value: str) -> str:
    return sha256(f"{SECRET}:{value}".encode()).hexdigest()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    derived = pbkdf2_hmac("sha256", f"{SECRET}:{password}".encode(), salt.encode(), PBKDF2_ITERATIONS)
    return f"pbkdf2${PBKDF2_ITERATIONS}${salt}${derived.hex()}"


def verify_password(password: str, stored: str) -> bool:
    if stored.startswith("pbkdf2$"):
        try:
            _, iterations, salt, expected = stored.split("$")
            derived = pbkdf2_hmac("sha256", f"{SECRET}:{password}".encode(), salt.encode(), int(iterations))
            return hmac.compare_digest(derived.hex(), expected)
        except (ValueError, TypeError):
            return False
    return hmac.compare_digest(stored, _legacy_digest(password))


def needs_rehash(stored: str) -> bool:
    return not stored.startswith("pbkdf2$")


# --- Light in-memory rate limiting (per process). ---
_rate_buckets: dict[str, list[float]] = {}


def rate_limit(key: str, limit: int, window_seconds: float = 60.0) -> None:
    now = time.time()
    bucket = [stamp for stamp in _rate_buckets.get(key, []) if now - stamp < window_seconds]
    if len(bucket) >= limit:
        raise HTTPException(429, "Too many requests — please slow down and try again shortly.")
    bucket.append(now)
    _rate_buckets[key] = bucket
    if len(_rate_buckets) > 5000:  # keep the bucket map bounded
        cutoff = now - 300
        for stale in [k for k, stamps in _rate_buckets.items() if not stamps or stamps[-1] < cutoff]:
            _rate_buckets.pop(stale, None)

class Signup(BaseModel):
    email: str
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class Login(BaseModel):
    email: str
    password: str


class Profile(BaseModel):
    home_city: Optional[str] = None
    interests: list[str] = Field(default_factory=list)


class Chat(BaseModel):
    session_id: str
    message: str = Field(min_length=1)


class Expense(BaseModel):
    category: str
    amount: float = Field(gt=0)
    note: str = ""


def digest(value: str) -> str:
    return sha256(f"{SECRET}:{value}".encode()).hexdigest()


# Local demo account so the first run has a usable login flow.
if "local-demo" not in users:
    demo_user = {"id": "local-demo", "email": "vedant@gamil.com", "name": "Vedant", "interests": [], "home_city": None, "password": hash_password("123456")}
    users[demo_user["id"]] = demo_user
    save_db()


def public(user: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in user.items() if key != "password"}


def token(user_id: str) -> str:
    expires = int((datetime.now(timezone.utc) + timedelta(days=7)).timestamp())
    payload = f"{user_id}.{expires}"
    signature = hmac.new(SECRET.encode(), payload.encode(), sha256).hexdigest()
    return f"{payload}.{signature}"


def raw_token(request: Request) -> Optional[str]:
    """Read the auth token from X-NOW-Token (preferred) or Authorization: Bearer.

    Some hosting proxies strip the Authorization header; the custom header
    survives them. Both carry the same opaque token.
    """
    custom = (request.headers.get("x-now-token") or "").strip()
    if custom:
        return custom
    auth = (request.headers.get("authorization") or "").strip()
    scheme, _, credentials = auth.partition(" ")
    if scheme.lower() == "bearer" and credentials.strip():
        return credentials.strip()
    return None


def user_from_token(request: Request) -> dict[str, Any]:
    raw = raw_token(request)
    if not raw:
        raise HTTPException(401, "Authentication required")
    parts = raw.split(".")
    if len(parts) != 3:
        raise HTTPException(401, "Invalid token")
    user_id, expires, signature = parts
    payload = f"{user_id}.{expires}"
    expected = hmac.new(SECRET.encode(), payload.encode(), sha256).hexdigest()
    if not hmac.compare_digest(signature, expected) or int(expires) < int(datetime.now(timezone.utc).timestamp()):
        raise HTTPException(401, "Invalid or expired token")
    if user_id not in users:
        raise HTTPException(401, "User not found")
    return users[user_id]


def itinerary(message: str) -> dict[str, Any]:
    lowered = message.lower()
    if "mahabaleshwar" in lowered or "malabaleshwar" in lowered:
        return {
            "trip_title": "A slow, sweet escape to Mahabaleshwar",
            "destination": "Mahabaleshwar",
            "duration_days": 2,
            "currency": "INR",
            "total_budget": 10000,
            "summary": "A relaxed two-day hill-station escape for two with lake time, strawberry treats, scenic viewpoints, and room in the budget for a memorable dinner.",
            "days": [
                {
                    "day_number": 1,
                    "title": "Lakes, berries, and sunset",
                    "activities": [
                        {"title": "Venna Lake boat ride", "category": "nature", "time": "10:00", "cost": 500, "lat": 17.9236, "lng": 73.6584},
                        {"title": "Mapro Garden lunch and strawberry cream", "category": "food", "time": "13:00", "cost": 900, "lat": 17.9227, "lng": 73.7121},
                        {"title": "Wilson Point sunset", "category": "nature", "time": "17:30", "cost": 0, "lat": 17.9307, "lng": 73.6681},
                        {"title": "Cozy couple dinner", "category": "food", "time": "20:00", "cost": 1200, "lat": 17.9246, "lng": 73.6578},
                    ],
                },
                {
                    "day_number": 2,
                    "title": "Fort views and a gentle drive",
                    "activities": [
                        {"title": "Pratapgad Fort morning visit", "category": "culture", "time": "08:30", "cost": 300, "lat": 17.9364, "lng": 73.5786},
                        {"title": "Lingmala Waterfall viewpoint", "category": "nature", "time": "13:00", "cost": 100, "lat": 17.9238, "lng": 73.7137},
                        {"title": "Local market and fudge shopping", "category": "shopping", "time": "16:00", "cost": 700, "lat": 17.9248, "lng": 73.6576},
                    ],
                },
            ],
        }
    destination = next((name.title() for name in ("bali", "tokyo", "london", "lisbon", "iceland", "paris") if name in lowered), "Paris")
    return {"trip_title": f"A quick escape to {destination}", "destination": destination, "duration_days": 2, "currency": "USD", "total_budget": 800, "summary": f"A compact weekend exploring {destination}.", "days": [{"day_number": 1, "title": "Arrive and wander", "activities": [{"title": "Local market walk", "category": "food", "time": "10:00", "cost": 30, "lat": 48.8566, "lng": 2.3522}, {"title": "Golden-hour viewpoint", "category": "sightseeing", "time": "17:00", "cost": 0, "lat": 48.8606, "lng": 2.3376}]}, {"day_number": 2, "title": "One more good story", "activities": [{"title": "Neighborhood breakfast", "category": "food", "time": "09:00", "cost": 20, "lat": 48.853, "lng": 2.3499}]}]}


async def claude_itinerary(message: str, history: list[dict[str, str]]) -> tuple[str, dict[str, Any]]:
    if claude is None:
        return "I’m using the local planner because ANTHROPIC_API_KEY is not configured.", itinerary(message)

    system = """You are NOW, an adventurous but practical travel planner. Return ONLY valid JSON, with no markdown fences, using this exact shape:
{"reply":"short conversational answer","itinerary":{"trip_title":"string","destination":"string","duration_days":2,"currency":"USD","total_budget":800,"summary":"string","days":[{"day_number":1,"title":"string","activities":[{"title":"string","category":"food|sightseeing|adventure|culture|transport|stay|nightlife|nature|relaxation","time":"HH:MM","cost":0,"lat":0.0,"lng":0.0}]}]}}
Infer missing details conservatively. Keep the plan realistic and concise. Coordinates must be numeric and approximate the destination. Do not include extra top-level keys."""
    messages = [{"role": item["role"], "content": item["content"]} for item in history[-8:]]
    messages.append({"role": "user", "content": message})
    response = await claude.messages.create(model=CLAUDE_MODEL, max_tokens=1800, temperature=0.4, system=system, messages=messages)
    text = "".join(block.text for block in response.content if getattr(block, "type", None) == "text").strip()
    if text.startswith("```"):
        text = text.removeprefix("```json").removesuffix("```").strip()
    result = json.loads(text)
    return result["reply"], result["itinerary"]


@app.get("/api/")
async def root() -> dict[str, str]:
    return {"message": "NOW API is running"}


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/signup")
async def signup(payload: Signup) -> dict[str, Any]:
    email = payload.email.strip().lower()
    rate_limit(f"signup:{email}", 10)
    if any(item["email"] == email for item in users.values()):
        raise HTTPException(409, "Email already registered")
    user = {"id": secrets.token_urlsafe(12), "email": email, "name": payload.name.strip(), "interests": [], "home_city": None, "password": hash_password(payload.password)}
    users[user["id"]] = user
    save_db()
    return {"token": token(user["id"]), "user": public(user)}


@app.post("/api/auth/login")
async def login(payload: Login) -> dict[str, Any]:
    email = payload.email.strip().lower()
    rate_limit(f"login:{email}", 10)
    user = next((item for item in users.values() if item["email"] == email), None)
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")
    if needs_rehash(user["password"]):
        user["password"] = hash_password(payload.password)
        save_db()
    return {"token": token(user["id"]), "user": public(user)}


@app.get("/api/auth/me")
async def me(user: dict[str, Any] = Depends(user_from_token)) -> dict[str, Any]:
    return public(user)


@app.patch("/api/auth/me")
async def update_me(payload: Profile, user: dict[str, Any] = Depends(user_from_token)) -> dict[str, Any]:
    user.update(payload.model_dump())
    save_db()
    return public(user)


@app.post("/api/chat/message")
async def chat(payload: Chat, user: dict[str, Any] = Depends(user_from_token)) -> dict[str, Any]:
    key = f"{user['id']}:{payload.session_id}"
    history = sessions.setdefault(key, [])
    rate_limit(f"chat:{user['id']}", 30)
    # Personalize the request with the traveller's saved profile so plans
    # respect their home city and interests (used by local + Claude paths).
    profile_bits = []
    if user.get("home_city"):
        profile_bits.append(f"home city: {user['home_city']}")
    if user.get("interests"):
        profile_bits.append(f"interests: {', '.join(user['interests'])}")
    message = payload.message
    if profile_bits:
        message = f"[Traveller profile — {'; '.join(profile_bits)}]\n\n{message}"
    try:
        reply, plan = await claude_itinerary(message, history)
    except (json.JSONDecodeError, KeyError, TypeError) as error:
        raise HTTPException(502, "Claude returned an invalid itinerary. Please try again.") from error
    except Exception as error:
        raise HTTPException(502, "Claude is unavailable right now. Please try again.") from error
    history.extend([{"role": "user", "content": payload.message}, {"role": "assistant", "content": reply}])
    save_db()
    return {"reply": reply, "itinerary": plan, "provider": "claude" if claude else "local"}


@app.get("/api/chat/history/{session_id}")
async def history(session_id: str, user: dict[str, Any] = Depends(user_from_token)) -> dict[str, Any]:
    return {"messages": sessions.get(f"{user['id']}:{session_id}", [])}


@app.post("/api/trips")
async def create_trip(data: dict[str, Any], user: dict[str, Any] = Depends(user_from_token)) -> dict[str, Any]:
    trip = {"id": secrets.token_urlsafe(12), "user_id": user["id"], "itinerary": data, "created_at": datetime.now(timezone.utc).isoformat()}
    trips[trip["id"]] = trip
    save_db()
    return trip


@app.get("/api/trips")
async def list_trips(user: dict[str, Any] = Depends(user_from_token)) -> dict[str, Any]:
    return {"trips": [trip for trip in trips.values() if trip["user_id"] == user["id"]]}


@app.get("/api/trips/{trip_id}")
async def get_trip(trip_id: str, user: dict[str, Any] = Depends(user_from_token)) -> dict[str, Any]:
    trip = trips.get(trip_id)
    if not trip or trip["user_id"] != user["id"]:
        raise HTTPException(404, "Trip not found")
    return trip


@app.delete("/api/trips/{trip_id}")
async def delete_trip(trip_id: str, user: dict[str, Any] = Depends(user_from_token)) -> dict[str, bool]:
    trip = trips.get(trip_id)
    if not trip or trip["user_id"] != user["id"]:
        raise HTTPException(404, "Trip not found")
    del trips[trip_id]
    save_db()
    return {"deleted": True}


@app.post("/api/trips/{trip_id}/expenses")
async def add_expense(trip_id: str, payload: Expense, user: dict[str, Any] = Depends(user_from_token)) -> dict[str, Any]:
    trip = trips.get(trip_id)
    if not trip or trip["user_id"] != user["id"]:
        raise HTTPException(404, "Trip not found")
    item = {"id": secrets.token_urlsafe(12), "trip_id": trip_id, **payload.model_dump()}
    expenses[item["id"]] = item
    save_db()
    return item


@app.get("/api/trips/{trip_id}/expenses")
async def list_expenses(trip_id: str, user: dict[str, Any] = Depends(user_from_token)) -> dict[str, Any]:
    trip = trips.get(trip_id)
    if not trip or trip["user_id"] != user["id"]:
        raise HTTPException(404, "Trip not found")
    return {"expenses": [item for item in expenses.values() if item["trip_id"] == trip_id]}


@app.delete("/api/expenses/{expense_id}")
async def delete_expense(expense_id: str, user: dict[str, Any] = Depends(user_from_token)) -> dict[str, bool]:
    item = expenses.get(expense_id)
    trip = trips.get(item["trip_id"]) if item else None
    if not item or not trip or trip["user_id"] != user["id"]:
        raise HTTPException(404, "Expense not found")
    del expenses[expense_id]
    save_db()
    return {"deleted": True}
