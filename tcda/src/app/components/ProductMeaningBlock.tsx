import { useTranslation } from "react-i18next";
import { productMeaning } from "../data/productMeaning";

interface Props {
  productId: string;
}

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "11px",
  opacity: 0.5,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "white",
};

const VALUE_STYLE: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "16px",
  color: "white",
};

const ROW_STYLE: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  padding: "16px 0",
};

export function ProductMeaningBlock({ productId }: Props) {
  const { t } = useTranslation();
  const meaning = productMeaning[productId];
  if (!meaning) return null;

  const rows = [
    { labelKey: "product.designIntent", value: meaning.designIntent },
    { labelKey: "product.bestFor",      value: meaning.bestFor },
    { labelKey: "product.silhouette",   value: meaning.silhouette },
    { labelKey: "product.materialFeel", value: meaning.materialFeel },
    { labelKey: "product.stylePairing", value: meaning.stylePairing },
  ];

  return (
    <div className="mt-2">
      <p
        className="mb-4"
        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "white", letterSpacing: "0.08em" }}
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
