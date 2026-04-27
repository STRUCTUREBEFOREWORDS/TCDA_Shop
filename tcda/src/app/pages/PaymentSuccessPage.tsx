import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Check } from "lucide-react";
import { useGlobalContext } from "./Root";
import { useTranslation } from "react-i18next";
import { trackPurchase } from "../utils/analytics";

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useGlobalContext();
  const { t } = useTranslation();

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
