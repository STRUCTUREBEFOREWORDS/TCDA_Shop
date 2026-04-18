import { useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

const API_URL = "https://api.tcdashop.com";

export function ReviewPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const initialRating = parseInt(searchParams.get("rating") ?? "0", 10);
  const [rating, setRating] = useState(isNaN(initialRating) ? 0 : initialRating);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    setError("");
    try {
      const verifyRes = await fetch(`${API_URL}/reviews/verify/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true }),
      });
      if (!verifyRes.ok) throw new Error("verify failed");

      const saveRes = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, body, name: name || undefined }),
      });
      if (!saveRes.ok) throw new Error("save failed");

      setDone(true);
    } catch {
      setError(t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-2xl">✓</p>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-black/60">
            {t("review.thanks")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-10">
        <div className="space-y-2">
          <p className="text-[10px] font-light tracking-[0.4em] uppercase text-black/30">TCDA</p>
          <h1 className="text-sm font-light tracking-[0.2em] uppercase text-black">
            {t("review.title")}
          </h1>
          <p className="text-[10px] font-light tracking-wider text-black/40">
            {t("review.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Star rating */}
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className="text-2xl transition-opacity duration-150"
              >
                <span className={(hovered || rating) >= n ? "opacity-100" : "opacity-20"}>
                  ★
                </span>
              </button>
            ))}
          </div>

          {/* Review body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("review.bodyPlaceholder")}
            rows={5}
            className="w-full border-b border-black/20 bg-transparent text-xs font-light tracking-wider text-black placeholder-black/30 resize-none focus:outline-none focus:border-black/60 transition-colors duration-200 py-2"
          />

          {/* Name (optional) */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("review.namePlaceholder")}
            className="w-full border-b border-black/20 bg-transparent text-xs font-light tracking-wider text-black placeholder-black/30 focus:outline-none focus:border-black/60 transition-colors duration-200 py-2"
          />

          {error && (
            <p className="text-[10px] text-red-500 tracking-wider">{error}</p>
          )}

          <button
            type="submit"
            disabled={!rating || submitting}
            className="w-full border border-black/30 text-black/60 text-[10px] font-light tracking-[0.4em] uppercase py-4 hover:border-black hover:text-black transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "..." : t("review.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
