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
import anthropic

router = APIRouter()

VAPID_PRIVATE_KEY = os.environ["VAPID_PRIVATE_KEY"]
VAPID_CLAIMS = {
    "sub": os.environ.get("VAPID_MAILTO", "mailto:admin@tcdashop.com"),
}
INTERNAL_API_KEY = os.environ["INTERNAL_API_KEY"]
_anthropic = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def _translate(title: str, body: str, lang: str) -> dict:
    """Translate title/body from Japanese to target lang via Claude Haiku."""
    prompt = (
        f"以下の日本語テキストを{lang}に翻訳してください。"
        f'JSON形式で{{"title": ..., "body": ...}}として返してください。\n\n'
        f"title: {title}\nbody: {body}"
    )
    msg = _anthropic.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
    )
    text = msg.content[0].text.strip()
    start, end = text.find("{"), text.rfind("}") + 1
    return json.loads(text[start:end])


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
            cur.execute("SELECT DISTINCT lang FROM push_subscriptions")
            langs = [r[0] for r in cur.fetchall()]
            cur.execute("SELECT endpoint, p256dh, auth, lang FROM push_subscriptions")
            rows = cur.fetchall()
    finally:
        conn.close()

    # Build per-lang translated payloads
    translations: dict = {}
    for lang in langs:
        if lang == "ja":
            translations[lang] = {"title": payload.title, "body": payload.body}
        else:
            try:
                translations[lang] = _translate(payload.title, payload.body, lang)
            except Exception:
                translations[lang] = {"title": payload.title, "body": payload.body}

    success, failed = 0, 0
    for endpoint, p256dh, auth, lang in rows:
        t = translations.get(lang) or {"title": payload.title, "body": payload.body}
        lang_url = payload.url.replace("/ja/", f"/{lang}/")
        data = json.dumps({"title": t["title"], "body": t["body"], "url": lang_url})
        try:
            webpush(
                subscription_info={"endpoint": endpoint, "keys": {"p256dh": p256dh, "auth": auth}},
                data=data,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS,
            )
            success += 1
        except WebPushException as e:
            if hasattr(e, "response") and e.response and e.response.status_code == 410:
                conn2 = get_db()
                try:
                    with conn2.cursor() as cur:
                        cur.execute("DELETE FROM push_subscriptions WHERE endpoint = %s", (endpoint,))
                        conn2.commit()
                finally:
                    conn2.close()
            failed += 1

    return {"success": success, "failed": failed, "total": len(rows)}
