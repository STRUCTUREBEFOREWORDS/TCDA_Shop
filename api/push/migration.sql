CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         SERIAL PRIMARY KEY,
  endpoint   TEXT UNIQUE NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  lang       VARCHAR(5) DEFAULT 'ja',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
