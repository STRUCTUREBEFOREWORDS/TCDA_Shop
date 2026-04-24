import { useTranslation } from "react-i18next";

interface Props {
  productId: string;
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "11px",
  opacity: 0.5,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "white",
};

const VALUE_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "16px",
  color: "white",
};

const ROW_STYLE: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  padding: "16px 0",
};

const FIELDS = ["designIntent", "bestFor", "silhouette", "materialFeel", "stylePairing"] as const;

export function ProductMeaningBlock({ productId }: Props) {
  const { t, i18n } = useTranslation();

  const baseKey = `productMeaning.${productId}.designIntent`;
  if (!i18n.exists(baseKey)) return null;

  const rows = FIELDS.map((field) => ({
    labelKey: `product.${field}`,
    value: t(`productMeaning.${productId}.${field}`),
  }));

  return (
    <div className="mt-2">
      <p
        className="mb-4"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "white", letterSpacing: "0.08em" }}
      >
        {t("product.meaningTitle")}
      </p>
      {rows.map(({ labelKey, value }) => (
        <div key={labelKey} style={ROW_STYLE}>
          <p style={LABEL_STYLE}>{t(labelKey)}</p>
          <p style={{ ...VALUE_STYLE, marginTop: "6px" }}>{value}</p>
        </div>
      ))}
    </div>
  );
}
