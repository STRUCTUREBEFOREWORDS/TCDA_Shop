import { useNavigate } from "react-router";
import { X } from "lucide-react";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";

export function PaymentCancelledPage() {
  const navigate = useNavigate();
  const { language } = useGlobalContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-14">
      <div className="text-center space-y-8 px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/20">
          <X className="h-8 w-8 text-black/40" strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h1 className="text-black text-xs font-light tracking-[0.4em] uppercase">
            {language === "ja" ? "注文キャンセル" : language === "fr" ? "Commande annulée" : "Order Cancelled"}
          </h1>
          <p className="text-black/40 text-xs font-light tracking-widest">
            {language === "ja"
              ? "お支払いがキャンセルされました。"
              : language === "fr"
              ? "Votre paiement a été annulé."
              : "Your payment was cancelled."}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => navigate(-1 as any)}
            className="text-black text-xs font-light tracking-[0.25em] uppercase border-b border-black/20 pb-1 hover:border-black transition-colors"
          >
            {language === "ja" ? "カートに戻る" : language === "fr" ? "Retour au panier" : "Back to Cart"}
          </button>
          <button
            onClick={() => navigate(`/${language}/`)}
            className="text-black/40 text-xs font-light tracking-[0.25em] uppercase hover:text-black transition-colors"
          >
            {t("continueShopping")}
          </button>
        </div>
      </div>
    </div>
  );
}
