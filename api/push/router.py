"""
Push notification endpoints.
Add to main.py:
    from api.push.router import router as push_router
    app.include_router(push_router, prefix="/push")

Environment variables required:
    VAPID_PRIVATE_KEY  — generated with `npx web-push generate-vapid-keys`
    VAPID_PUBLIC_KEY
    VAPID_MAILTO       — e.g. mailto:you@example.com
    INTERNAL_API_KEY   — secret for /push/send
"""

import os
import json
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from pywebpush import webpush, WebPushException
import psycopg2

router = APIRouter()

VAPID_PRIVATE_KEY = os.environ["VAPID_PRIVATE_KEY"]
VAPID_CLAIMS = {
    "sub": os.environ.get("VAPID_MAILTO", "mailto:admin@tcdashop.com"),
}
INTERNAL_API_KEY = os.environ["INTERNAL_API_KEY"]


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


# ── Schema ──────────────────────────────────────────────────────────────

class SubscribeBody(BaseModel):
    endpoint: str
    p256dh: str
    auth: str
    lang: str = "ja"


class SendBody(BaseModel):
    title: str
    body: str
    url: str = "/ja/collection"


# ── Endpoints ───────────────────────────────────────────────────────────

@router.post("/subscribe")
def subscribe(payload: SubscribeBody):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO push_subscriptions (endpoint, p256dh, auth, lang)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (endpoint) DO UPDATE
                    SET p256dh = EXCLUDED.p256dh,
                        auth   = EXCLUDED.auth,
                        lang   = EXCLUDED.lang
                """,
                (payload.endpoint, payload.p256dh, payload.auth, payload.lang),
            )
            conn.commit()
    finally:
        conn.close()
    return {"ok": True}


@router.post("/send")
def send_push(payload: SendBody, x_api_key: str = Header(default="")):
    if x_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT endpoint, p256dh, auth FROM push_subscriptions")
            rows = cur.fetchall()
    finally:
        conn.close()

    data = json.dumps({"title": payload.title, "body": payload.body, "url": payload.url})
    success, failed = 0, 0

    for endpoint, p256dh, auth in rows:
        try:
            webpush(
                subscription_info={"endpoint": endpoint, "keys": {"p256dh": p256dh, "auth": auth}},
                data=data,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS,
            )
            success += 1
        except WebPushException as e:
            # 410 Gone = subscription expired, could delete here
            failed += 1

    return {"success": success, "failed": failed, "total": len(rows)}
