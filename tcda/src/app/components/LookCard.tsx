import { Link } from "react-router";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../pages/Root";
import { useConvertAndFormat } from "../hooks/useConvertAndFormat";

const CDN = "https://cdn.tcdashop.com/";

export type Look = { pid: string; imgs: string[] };
export type ProductInfo = { id: string; name: string; price: number; shipping_available?: boolean };

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function LookCard({ look, product, eager = false }: { look: Look; product?: ProductInfo; eager?: boolean }) {
  const { language } = useGlobalContext();
  const { t } = useTranslation();
  const convertAndFormat = useConvertAndFormat();
  const { pid, imgs } = look;
  const name = product?.name ?? "";
  const to = `/${language}/product/${pid}`;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={to}
        style={{ display: "grid", gridTemplateColumns: `repeat(${imgs.length}, 1fr)`, gap: "2px" }}
      >
        {imgs.map((img, i) => (
          <img
            key={img}
            src={`${CDN}${img}`}
            alt={`${name || "TCDA Lookbook"} ${i + 1}`}
            style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
            loading={eager ? "eager" : "lazy"}
          />
        ))}
      </Link>
      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
        {name && (
          <span className="text-sm uppercase" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
            {name}
          </span>
        )}
        {product && (
          <span style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}>
            {convertAndFormat(product.price)}
          </span>
        )}
        <Link
          to={to}
          className="inline-block text-xs uppercase"
          style={{
            background: "transparent",
            color: "var(--accent-electric)",
            border: "1px solid var(--accent-electric)",
            padding: "12px 24px",
            fontFamily: "var(--font-body)",
            letterSpacing: "var(--ls-nav)",
          }}
        >
          {t("lookbook.viewProduct")} →
        </Link>
      </div>
    </motion.div>
  );
}
