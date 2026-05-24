import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Check } from "lucide-react";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { trackPurchase } from "../utils/analytics";

const NEWSLETTER_KEY = "newsletter_subscribed";

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useGlobalContext();
  const { t } = useTranslation();

  const alreadySubscribed = !!localStorage.getItem(NEWSLETTER_KEY);
  const [nlEmail, setNlEmail] = useState(searchParams.get("email") ?? "");
  const [nlStatus, setNlStatus] = useState<"idle" | "loading" | "done" | "hidden">(
    alreadySubscribed ? "hidden" : "idle"
  );

  const nlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail || nlStatus !== "idle") return;
    setNlStatus("loading");
    try {
      const res = await fetch("https://api.tcdashop.com/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail, lang: language }),
      });
      if (res.ok) {
        localStorage.setItem(NEWSLETTER_KEY, "1");
        setNlStatus("done");
        setTimeout(() => setNlStatus("hidden"), 3000);
      } else {
        setNlStatus("idle");
      }
    } catch {
      setNlStatus("idle");
    }
  };

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'Purchase',
      value: 0,
      currency: 'JPY'
    });
    const orderId = searchParams.get("session_id") ?? "unknown";
    trackPurchase(orderId, 0, "JPY");
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-14">
      <div className="text-center space-y-8 px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black">
          <Check className="h-8 w-8 text-white" strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h1 className="text-black text-xs font-light tracking-[0.4em] uppercase">
            {t("order.confirmed")}
          </h1>
          <p className="text-black/40 text-xs font-light tracking-widest">
            {t("order.confirmedMessage")}
          </p>
        </div>
        {/* Newsletter opt-in */}
        {nlStatus !== "hidden" && (
          <div className="space-y-4 max-w-sm mx-auto">
            <p className="text-black/50 text-xs font-light tracking-widest">
              {t("order.newsletterHeading")}
            </p>
            {nlStatus === "done" ? (
              <p className="text-black text-xs font-light tracking-[0.3em] uppercase">
                {t("footer.newsletterSubscribed")}
              </p>
            ) : (
              <form onSubmit={nlSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  placeholder={t("footer.newsletterPlaceholder")}
                  required
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    color: "#080808",
                    background: "transparent",
                    border: "1px solid #ccc",
                    padding: "8px 12px",
                    outline: "none",
                    flex: 1,
                  }}
                />
                <button
                  type="submit"
                  disabled={nlStatus === "loading"}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    color: "#fff",
                    background: "#080808",
                    border: "none",
                    padding: "8px 16px",
                    cursor: nlStatus === "loading" ? "wait" : "pointer",
                    opacity: nlStatus === "loading" ? 0.5 : 1,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {nlStatus === "loading" ? "..." : t("footer.newsletterSubscribe")}
                </button>
              </form>
            )}
          </div>
        )}

        <button
          onClick={() => navigate(`/${language}/`)}
          className="text-black text-xs font-light tracking-[0.25em] uppercase border-b border-black/20 pb-1 hover:border-black transition-colors"
        >
          {t("order.returnHome")}
        </button>
      </div>
    </div>
  );
}
