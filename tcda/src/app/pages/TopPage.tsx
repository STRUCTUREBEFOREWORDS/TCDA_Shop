import { motion } from "motion/react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";
import { useProducts } from "../hooks/useProducts";
import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const WORLD_IMAGES = [
  "https://cdn.tcdashop.com/top/2.webp",
  "https://cdn.tcdashop.com/top/3.webp",
  "https://cdn.tcdashop.com/top/4.webp",
];

const heroLine: Record<string, string> = {
  en: "You were never meant to fit in.",
  ja: "あなたは最初から「普通」に属していなかった。",
  fr: "Vous n'étiez jamais censé vous conformer.",
  es: "Nunca se supuso que encajaras.",
  ko: "당신은 처음부터 맞지 않았습니다.",
  zh: "你从来都不是为了融入而生的。",
};

const worldText: Record<string, { line1: string; line2: string }> = {
  en: { line1: "Art you wear.", line2: "Identity you claim." },
  ja: { line1: "アートを着る。", line2: "感性を解放する。" },
  fr: { line1: "L'art que vous portez.", line2: "L'identité que vous revendiquez." },
  es: { line1: "Arte que vistes.", line2: "Identidad que proclamas." },
  ko: { line1: "입는 아트.", line2: "선언하는 정체성." },
  zh: { line1: "穿戴的艺术。", line2: "宣示的身份。" },
};

export function TopPage() {
  const { language, currency, rates } = useGlobalContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const { products } = useProducts();

  const w = worldText[language] ?? worldText.en;

  const convertAndFormat = (jpy: number) => {
    const rate = rates[currency] ?? 1;
    const converted = currency === "JPY"
      ? Math.round(jpy)
      : Math.round(jpy * rate * 100) / 100;
    return formatPrice(converted, currency);
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TCDA",
    "url": "https://tcdashop.com",
    "logo": "https://cdn.tcdashop.com/logo/1.png",
    "sameAs": [
      "https://jp.pinterest.com/tcda_shop/",
      "https://www.tiktok.com/@tcda.shop",
      "https://www.instagram.com/tcda.shop/",
      "https://x.com/tcda_shop"
    ],
    "description": "Transcend Color Digital Apparel — アートを着る、感性を解放する。"
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TCDA",
    "url": "https://tcdashop.com"
  };

  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      </Helmet>

      {/* 1. HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        <img
          src="https://cdn.tcdashop.com/top/1.webp"
          alt="TCDA"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-white text-base md:text-xl font-extralight tracking-[0.2em] leading-[160%] max-w-2xl"
          >
            {heroLine[language] ?? heroLine.en}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="mt-16"
          >
            <Link
              to={`/${language}/products`}
              className="text-white/70 text-[10px] font-light tracking-[0.4em] uppercase hover:text-white transition-colors duration-500 border-b border-white/20 hover:border-white/60 pb-2"
            >
              {t("shop")}
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.6, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-10 bg-white/20" />
        </motion.div>
      </section>

      {/* 2. WORLD */}
      <section className="bg-black py-32 px-6 md:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-white text-3xl sm:text-4xl md:text-6xl font-extralight tracking-wide leading-[1.4] mb-4">
            {w.line1}
          </p>
          <p className="text-white/40 text-3xl sm:text-4xl md:text-6xl font-extralight tracking-wide leading-[1.4]">
            {w.line2}
          </p>
        </motion.div>
      </section>

      {/* 3. VISUAL — 3枚横並び */}
      <section className="bg-black px-6 md:px-10 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-3 md:gap-6">
          {WORLD_IMAGES.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={`/${language}/collection`}>
                <div className="aspect-[2/3] overflow-hidden bg-white/5">
                  <img
                    src={src}
                    alt={`TCDA ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-7xl mx-auto mt-8 flex justify-end"
        >
          <Link
            to={`/${language}/collection`}
            className="text-white/50 text-[10px] font-light tracking-[0.3em] uppercase hover:text-white/70 transition-colors duration-300 border-b border-white/10 hover:border-white/40 pb-1"
          >
            {t("viewAll")}
          </Link>
        </motion.div>
      </section>

      {/* 4. COLLECTION */}
      <section className="bg-black py-20 px-6 md:px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-center justify-between">
            <p className="text-white/50 text-[10px] font-light tracking-[0.4em] uppercase">
              {t("collection")}
            </p>
            <Link
              to={`/${language}/products`}
              className="text-white/50 text-[10px] font-light tracking-[0.3em] uppercase hover:text-white/70 transition-colors duration-300 border-b border-white/10 hover:border-white/40 pb-1"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
            {products.slice(0, 6).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/${language}/product/${product.id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-white/5 mb-4">
                    <ImageWithFallback
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-white/50 text-[10px] font-light tracking-[0.3em] uppercase group-hover:text-white/90 transition-colors duration-300">
                      {product.name}
                    </p>
                    <p className="text-white text-sm font-extralight tracking-wider">
                      {convertAndFormat(product.price)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
