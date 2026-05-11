from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.llm.chat import LlmChat, UserMessage

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="IronVibe API")
api = APIRouter(prefix="/api")
bearer_scheme = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ironvibe")

LIFTS = ["bench", "squat", "deadlift", "ohp", "row", "pullup"]
LiftType = Literal["bench", "squat", "deadlift", "ohp", "row", "pullup"]

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=14),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> dict:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

class RegisterIn(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=6, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    display_name: Optional[str] = None
    avatar_color: Optional[str] = None
    created_at: str

class AuthOut(BaseModel):
    token: str
    user: UserOut

class PRCreate(BaseModel):
    lift: LiftType
    weight_kg: float = Field(gt=0, lt=1000)
    reps: int = Field(ge=1, le=20)
    notes: Optional[str] = Field(default=None, max_length=200)
    date: Optional[str] = None

class PROut(BaseModel):
    id: str
    user_id: str
    username: str
    lift: str
    weight_kg: float
    reps: int
    one_rm: float
    notes: Optional[str] = None
    date: str

class FriendOut(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    avatar_color: Optional[str] = None

class LeaderRow(BaseModel):
    user_id: str
    username: str
    avatar_color: Optional[str] = None
    best_one_rm: float
    best_weight_kg: float
    best_reps: int
    growth_per_week: float
    entries: int

class AIExerciseRequest(BaseModel):
    muscle: str = Field(min_length=2, max_length=40)
    equipment: Optional[str] = Field(default=None, max_length=40)

class AIExercise(BaseModel):
    name: str
    description: str
    primary_muscle: str
    difficulty: str
    sets_reps: str
    tip: str

class AIExerciseOut(BaseModel):
    muscle: str
    exercises: List[AIExercise]

NEON_PALETTE = ["#00d4ff", "#ff00aa", "#ffaa00", "#7cff00", "#ff3860", "#9b5cff", "#00ffd0"]

def epley_1rm(weight: float, reps: int) -> float:
    return round(weight * (1 + reps / 30.0), 2)

@api.post("/auth/register", response_model=AuthOut)
async def register(body: RegisterIn):
    email = body.email.lower()
    username = body.username.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await db.users.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "username": username,
        "display_name": body.username,
        "password_hash": hash_password(body.password),
        "avatar_color": NEON_PALETTE[hash(username) % len(NEON_PALETTE)],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id)
    user_out = {k: v for k, v in doc.items() if k != "password_hash"}
    return {"token": token, "user": user_out}

@api.post("/auth/login", response_model=AuthOut)
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"])
    user_out = {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "display_name": user.get("display_name"),
        "avatar_color": user.get("avatar_color"),
        "created_at": user["created_at"],
    }
    return {"token": token, "user": user_out}

@api.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return user

@api.get("/users/search")
async def search_users(q: str, user: dict = Depends(get_current_user)):
    q = q.strip().lower()
    if len(q) < 2:
        return []
    cursor = db.users.find(
        {"username": {"$regex": f"^{q}"}, "id": {"$ne": user["id"]}},
        {"_id": 0, "password_hash": 0, "email": 0},
    ).limit(10)
    return await cursor.to_list(10)

@api.get("/friends", response_model=List[FriendOut])
async def list_friends(user: dict = Depends(get_current_user)):
    rels = await db.friendships.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    if not rels:
        return []
    friend_ids = [r["friend_id"] for r in rels]
    friends = await db.users.find(
        {"id": {"$in": friend_ids}},
        {"_id": 0, "password_hash": 0, "email": 0, "created_at": 0},
    ).to_list(500)
    return friends

@api.post("/friends/{username}", response_model=FriendOut)
async def add_friend(username: str, user: dict = Depends(get_current_user)):
    username = username.lower()
    if username == user["username"]:
        raise HTTPException(status_code=400, detail="Cannot add yourself")
    friend = await db.users.find_one(
        {"username": username},
        {"_id": 0, "password_hash": 0, "email": 0, "created_at": 0},
    )
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
    existing = await db.friendships.find_one({"user_id": user["id"], "friend_id": friend["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already friends")
    await db.friendships.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "friend_id": friend["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return friend

@api.delete("/friends/{friend_id}")
async def remove_friend(friend_id: str, user: dict = Depends(get_current_user)):
    res = await db.friendships.delete_one({"user_id": user["id"], "friend_id": friend_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Friendship not found")
    return {"ok": True}

@api.post("/prs", response_model=PROut)
async def create_pr(body: PRCreate, user: dict = Depends(get_current_user)):
    date_str = body.date or datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "username": user["username"],
        "lift": body.lift,
        "weight_kg": float(body.weight_kg),
        "reps": int(body.reps),
        "one_rm": epley_1rm(body.weight_kg, body.reps),
        "notes": body.notes,
        "date": date_str,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.prs.insert_one(doc)
    doc.pop("created_at", None)
    return doc

@api.get("/prs/me", response_model=List[PROut])
async def list_my_prs(user: dict = Depends(get_current_user)):
    return await db.prs.find({"user_id": user["id"]}, {"_id": 0, "created_at": 0}).sort("date", -1).to_list(500)

@api.get("/prs/user/{username}", response_model=List[PROut])
async def list_user_prs(username: str, user: dict = Depends(get_current_user)):
    return await db.prs.find({"username": username.lower()}, {"_id": 0, "created_at": 0}).sort("date", -1).to_list(500)

@api.delete("/prs/{pr_id}")
async def delete_pr(pr_id: str, user: dict = Depends(get_current_user)):
    res = await db.prs.delete_one({"id": pr_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="PR not found")
    return {"ok": True}

async def _build_leaderboard_for_ids(user_ids: List[str], lift: str) -> List[LeaderRow]:
    if not user_ids:
        return []
    users = await db.users.find(
        {"id": {"$in": user_ids}},
        {"_id": 0, "id": 1, "username": 1, "avatar_color": 1},
    ).to_list(1000)
    rows: List[dict] = []
    for u in users:
        prs = await db.prs.find(
            {"user_id": u["id"], "lift": lift},
            {"_id": 0, "weight_kg": 1, "reps": 1, "one_rm": 1, "date": 1},
        ).to_list(1000)
        if not prs:
            continue
        best = max(prs, key=lambda p: p["one_rm"])
        prs_sorted = sorted(prs, key=lambda p: p["date"])
        first, last = prs_sorted[0], prs_sorted[-1]
        try:
            t1 = datetime.fromisoformat(first["date"].replace("Z", "+00:00"))
            t2 = datetime.fromisoformat(last["date"].replace("Z", "+00:00"))
            weeks = max((t2 - t1).total_seconds() / (7 * 86400), 1 / 7)
        except Exception:
            weeks = 1.0
        growth = round((last["one_rm"] - first["one_rm"]) / weeks, 2)
        rows.append({
            "user_id": u["id"],
            "username": u["username"],
            "avatar_color": u.get("avatar_color"),
            "best_one_rm": best["one_rm"],
            "best_weight_kg": best["weight_kg"],
            "best_reps": best["reps"],
            "growth_per_week": growth,
            "entries": len(prs),
        })
    rows.sort(key=lambda r: r["best_one_rm"], reverse=True)
    return rows

@api.get("/leaderboard/{lift}", response_model=List[LeaderRow])
async def leaderboard(lift: LiftType, scope: str = "friends", user: dict = Depends(get_current_user)):
    if scope == "global":
        all_users = await db.prs.distinct("user_id", {"lift": lift})
        return await _build_leaderboard_for_ids(all_users, lift)
    rels = await db.friendships.find({"user_id": user["id"]}, {"_id": 0, "friend_id": 1}).to_list(500)
    ids = [user["id"]] + [r["friend_id"] for r in rels]
    return await _build_leaderboard_for_ids(ids, lift)

@api.post("/ai/exercises", response_model=AIExerciseOut)
async def ai_exercises(body: AIExerciseRequest, user: dict = Depends(get_current_user)):
    muscle = body.muscle.strip().lower()
    equipment = (body.equipment or "any").strip().lower()
    system = (
        "You are an elite strength coach. Return ONLY valid JSON, no markdown, no prose. "
        "Suggest 6 effective exercises for the muscle group requested. "
        'JSON shape: {"exercises": [{"name": str, "description": str, "primary_muscle": str, '
        '"difficulty": "beginner"|"intermediate"|"advanced", "sets_reps": str, "tip": str}]}'
    )
    prompt = (
        f"Muscle group: {muscle}. Equipment: {equipment}. "
        "Mix compound + isolation when relevant. Keep descriptions under 25 words each. "
        "Return JSON only."
    )
    try:
        chat = (
            LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"ai-ex-{user['id']}-{uuid.uuid4()}", system_message=system)
            .with_model("openai", "gpt-4o-mini")
        )
        raw = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        logger.exception("LLM call failed")
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    import json, re
    text = raw.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    try:
        data = json.loads(text)
    except Exception:
        m = re.search(r"\{[\s\S]*\}", text)
        if not m:
            raise HTTPException(status_code=502, detail="AI returned invalid format")
        data = json.loads(m.group(0))

    exercises = data.get("exercises", [])[:8]
    return {"muscle": muscle, "exercises": exercises}

@api.get("/")
async def root():
    return {"app": "IronVibe", "status": "ok"}

@api.get("/lifts")
async def lifts():
    return {
        "lifts": [
            {"key": "bench", "label": "Bench Press"},
            {"key": "squat", "label": "Back Squat"},
            {"key": "deadlift", "label": "Deadlift"},
            {"key": "ohp", "label": "Overhead Press"},
            {"key": "row", "label": "Barbell Row"},
            {"key": "pullup", "label": "Pull-Up (Weighted)"},
        ]
    }

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.prs.create_index([("user_id", 1), ("lift", 1)])
    await db.friendships.create_index([("user_id", 1), ("friend_id", 1)], unique=True)
    await _seed_demo()

async def _seed_demo():
    demos = [
        {"email": "neon@ironvibe.app", "username": "neon", "password": "demo123", "display_name": "Neon"},
        {"email": "blaze@ironvibe.app", "username": "blaze", "password": "demo123", "display_name": "Blaze"},
        {"email": "vapor@ironvibe.app", "username": "vapor", "password": "demo123", "display_name": "Vapor"},
    ]
    created_ids = {}
    for d in demos:
        existing = await db.users.find_one({"email": d["email"]})
        if existing:
            created_ids[d["username"]] = existing["id"]
            continue
        uid = str(uuid.uuid4())
        await db.users.insert_one({
            "id": uid,
            "email": d["email"],
            "username": d["username"],
            "display_name": d["display_name"],
            "password_hash": hash_password(d["password"]),
            "avatar_color": NEON_PALETTE[hash(d["username"]) % len(NEON_PALETTE)],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        created_ids[d["username"]] = uid

    sample_prs = {
        "neon": [("bench", 80, 5, 30), ("bench", 85, 5, 14), ("bench", 90, 3, 0),
                 ("squat", 120, 5, 30), ("squat", 130, 3, 0), ("deadlift", 150, 3, 0)],
        "blaze": [("bench", 100, 3, 21), ("bench", 102.5, 3, 7), ("bench", 105, 2, 0),
                  ("squat", 140, 5, 14), ("squat", 145, 3, 0), ("ohp", 60, 5, 0)],
        "vapor": [("bench", 70, 5, 28), ("bench", 75, 5, 14), ("bench", 77.5, 3, 0),
                  ("deadlift", 160, 3, 14), ("deadlift", 170, 2, 0), ("pullup", 20, 5, 0)],
    }
    for uname, lifts_list in sample_prs.items():
        uid = created_ids.get(uname)
        if not uid:
            continue
        existing = await db.prs.find_one({"user_id": uid})
        if existing:
            continue
        for lift, w, reps, days_ago in lifts_list:
            date = (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat()
            await db.prs.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": uid,
                "username": uname,
                "lift": lift,
                "weight_kg": float(w),
                "reps": int(reps),
                "one_rm": epley_1rm(w, reps),
                "notes": None,
                "date": date,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

@app.on_event("shutdown")
async def shutdown():
    client.close()
