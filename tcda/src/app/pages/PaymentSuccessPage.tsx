import { useNavigate } from "react-router";
import { Check } from "lucide-react";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { language } = useGlobalContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-14">
      <div className="text-center space-y-8 px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black">
          <Check className="h-8 w-8 text-white" strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h1 className="text-black text-xs font-light tracking-[0.4em] uppercase">
            {language === "ja" ? "注文完了" : language === "fr" ? "Commande confirmée" : "Order Confirmed"}
          </h1>
          <p className="text-black/40 text-xs font-light tracking-widest">
            {language === "ja"
              ? "ご購入ありがとうございます。確認メールをお送りします。"
              : language === "fr"
              ? "Merci pour votre achat. Un e-mail de confirmation vous sera envoyé."
              : "Thank you for your purchase. A confirmation email will be sent shortly."}
          </p>
        </div>
        <button
          onClick={() => navigate(`/${language}/`)}
          className="text-black text-xs font-light tracking-[0.25em] uppercase border-b border-black/20 pb-1 hover:border-black transition-colors"
        >
          {t("continueShopping")}
        </button>
      </div>
    </div>
  );
}
