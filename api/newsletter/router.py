"""
Newsletter subscription endpoints.
Add to main.py:
    from api.newsletter.router import router as newsletter_router
    app.include_router(newsletter_router, prefix="/newsletter")

Environment variables required:
    DATABASE_URL       — PostgreSQL connection string (sync)
    RESEND_API_KEY     — Resend API key
    INTERNAL_API_KEY   — secret for /newsletter/send and /newsletter/subscribers
"""

import os
import urllib.parse
import psycopg2
import resend
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr

router = APIRouter()

resend.api_key = os.getenv("RESEND_API_KEY", "")
INTERNAL_API_KEY = os.environ["INTERNAL_API_KEY"]
FROM_ADDRESS = "TCDA <info@tcdashop.com>"

_LOGO_URL = "https://cdn.tcdashop.com/logo/tcda-icon.png"

_SNS_ICONS = {
    "instagram": "https://cdn.tcdashop.com/sns/instagram.png",
    "tiktok":    "https://cdn.tcdashop.com/sns/tiktok.png",
    "pinterest": "https://cdn.tcdashop.com/sns/pinterest.png",
    "x":         "https://cdn.tcdashop.com/sns/x.png",
}


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


_CONFIRM_SUBJECT = {
    "ja": "TCDAニュースレターへの登録が完了しました",
    "en": "You're subscribed to TCDA newsletter",
    "zh": "您已成功订阅TCDA新闻通讯",
    "ko": "TCDA 뉴스레터 구독이 완료되었습니다",
    "fr": "Vous êtes abonné à la newsletter TCDA",
    "de": "Sie haben den TCDA-Newsletter abonniert",
    "es": "Te has suscrito al boletín de TCDA",
    "it": "Sei iscritto alla newsletter TCDA",
    "pt": "Você assinou o newsletter da TCDA",
    "ar": "تم اشتراكك في النشرة الإخبارية لـ TCDA",
    "hi": "आप TCDA न्यूज़लेटर की सदस्यता ले चुके हैं",
}


def _confirm_html(lang: str, email: str) -> str:
    is_ja = lang == "ja"
    if is_ja:
        heading = "ご登録ありがとうございます"
        body_text = "TCDAニュースレターへのご登録が完了しました。<br>新作・限定コレクションの最新情報をいち早くお届けします。"
        unsubscribe_text = "配信停止はこちら"
    else:
        heading = "Thanks for subscribing"
        body_text = "You're now subscribed to the TCDA newsletter.<br>We'll keep you updated on new releases and exclusive collections."
        unsubscribe_text = "Unsubscribe"

    encoded_email = urllib.parse.quote(email)
    unsubscribe_url = f"https://api.tcdashop.com/newsletter/unsubscribe?email={encoded_email}"

    def _sns_cell(href, key, label):
        return (
            f'<td style="padding:0 12px;">'
            f'<a href="{href}" style="display:inline-block;opacity:0.7;text-decoration:none;">'
            f'<img src="{_SNS_ICONS[key]}" alt="{label}" width="24" height="24"'
            f' style="display:block;" /></a></td>'
        )

    sns_row = (
        _sns_cell("https://www.instagram.com/tcda.apparel/", "instagram", "Instagram") +
        _sns_cell("https://www.tiktok.com/@tcda.apparel",    "tiktok",    "TikTok") +
        _sns_cell("https://jp.pinterest.com/tcda_apparel/",  "pinterest", "Pinterest") +
        _sns_cell("https://x.com/tcda_apparel",              "x",         "X")
    )

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TCDA</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td align="center" style="padding-bottom:32px;">
        <a href="https://tcdashop.com/" style="display:inline-block;">
          <img src="{_LOGO_URL}" alt="TCDA" width="56" height="56"
               style="display:block;border-radius:4px;" />
        </a>
      </td></tr>
      <tr><td align="center" style="padding-bottom:16px;">
        <p style="margin:0;font-size:13px;letter-spacing:0.15em;color:#c8ff00;text-transform:uppercase;">
          {heading}
        </p>
      </td></tr>
      <tr><td align="center" style="padding-bottom:40px;">
        <p style="margin:0;font-size:13px;line-height:1.8;color:#a0a0a0;text-align:center;">
          {body_text}
        </p>
      </td></tr>
      <tr><td align="center" style="padding-bottom:48px;">
        <a href="https://tcdashop.com/"
           style="display:inline-block;background:#c8ff00;color:#080808;font-size:11px;
                  letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;
                  padding:12px 32px;">
          SHOP NOW
        </a>
      </td></tr>
      <tr><td align="center" style="padding-bottom:40px;">
        <table cellpadding="0" cellspacing="0"><tr>{sns_row}</tr></table>
      </td></tr>
      <tr><td align="center" style="border-top:1px solid #1e1e1e;padding-top:24px;">
        <p style="margin:0 0 8px;font-size:10px;color:#404040;letter-spacing:0.1em;">
          &copy; 2026 TCDA &nbsp;&middot;&nbsp;
          <a href="https://tcdashop.com/" style="color:#404040;text-decoration:none;">tcdashop.com</a>
        </p>
        <p style="margin:0;font-size:10px;color:#303030;letter-spacing:0.05em;">
          <a href="{unsubscribe_url}" style="color:#303030;text-decoration:underline;">
            {unsubscribe_text}
          </a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>"""


class SubscribeBody(BaseModel):
    email: EmailStr
    lang: str = "ja"


class SendBody(BaseModel):
    subject: str
    body_html: str
    lang: str | None = None


@router.post("/subscribe")
def subscribe(payload: SubscribeBody):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO newsletter_subscribers (email, lang)
                VALUES (%s, %s)
                ON CONFLICT (email) DO NOTHING
                """,
                (payload.email, payload.lang),
            )
            conn.commit()
    finally:
        conn.close()

    lang = payload.lang if payload.lang in _CONFIRM_SUBJECT else "en"
    resend.Emails.send({
        "from": FROM_ADDRESS,
        "to": [payload.email],
        "subject": _CONFIRM_SUBJECT[lang],
        "html": _confirm_html(lang, payload.email),
    })
    return {"ok": True}


@router.post("/send")
def send_newsletter(payload: SendBody, x_api_key: str = Header(default="")):
    if x_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conn = get_db()
    try:
        with conn.cursor() as cur:
            if payload.lang:
                cur.execute(
                    "SELECT email FROM newsletter_subscribers WHERE lang = %s",
                    (payload.lang,),
                )
            else:
                cur.execute("SELECT email FROM newsletter_subscribers")
            emails = [r[0] for r in cur.fetchall()]
    finally:
        conn.close()

    if not emails:
        return {"sent": 0}

    BATCH_SIZE = 100
    sent = 0
    for i in range(0, len(emails), BATCH_SIZE):
        batch = emails[i:i + BATCH_SIZE]
        resend.Batch.send([
            {
                "from": FROM_ADDRESS,
                "to": [email],
                "subject": payload.subject,
                "html": payload.body_html,
            }
            for email in batch
        ])
        sent += len(batch)

    return {"sent": sent}


@router.get("/subscribers")
def get_subscribers(x_api_key: str = Header(default="")):
    if x_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT email, lang, created_at FROM newsletter_subscribers ORDER BY created_at DESC"
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    return {
        "total": len(rows),
        "subscribers": [
            {"email": r[0], "lang": r[1], "created_at": r[2].isoformat()}
            for r in rows
        ],
    }


@router.get("/unsubscribe", response_class=HTMLResponse)
def unsubscribe(email: str):
    decoded = urllib.parse.unquote(email)
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM newsletter_subscribers WHERE email = %s", (decoded,)
            )
            conn.commit()
    finally:
        conn.close()

    return HTMLResponse(content=f"""<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TCDA — 配信停止</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;min-height:100vh;">
  <tr><td align="center" style="padding:80px 16px;">
    <table width="400" cellpadding="0" cellspacing="0" style="max-width:400px;width:100%;">
      <tr><td align="center" style="padding-bottom:24px;">
        <a href="https://tcdashop.com/">
          <img src="{_LOGO_URL}" alt="TCDA" width="48" height="48" style="display:block;" />
        </a>
      </td></tr>
      <tr><td align="center" style="padding-bottom:12px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.15em;color:#c8ff00;text-transform:uppercase;">
          Unsubscribed
        </p>
      </td></tr>
      <tr><td align="center">
        <p style="margin:0;font-size:12px;line-height:1.8;color:#606060;text-align:center;">
          配信停止が完了しました。<br>またいつでもご登録いただけます。
        </p>
      </td></tr>
      <tr><td align="center" style="padding-top:32px;">
        <a href="https://tcdashop.com/"
           style="display:inline-block;background:#c8ff00;color:#080808;font-size:11px;
                  letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;
                  padding:10px 28px;">
          SHOP
        </a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>""")
