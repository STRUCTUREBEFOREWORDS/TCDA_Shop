import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";
import { useProducts } from "../hooks/useProducts";
import { formatPrice } from "../utils/formatPrice";
import { applyPsychologicalPrice } from "../../utils/priceRounding";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useVAT } from "../hooks/useVAT";
import { JsonLd } from "../components/JsonLd";
import { pushDataLayer } from "../hooks/useDataLayer";
import { useGeoUI } from "../hooks/useGeoUI";
import { useTranslation } from "react-i18next";

const HERO_IMAGE = "https://cdn.tcdashop.com/top/1.webp";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 } as Record<string, unknown>,
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};

export function TopPage() {
  const { language, currency, rates, countryCode } = useGlobalContext();
  const { isEU } = useVAT();
  const geo = useGeoUI();
  const { t: ti18n } = useTranslation();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const { products } = useProducts();

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    pushDataLayer('page_view', {
      page_type: 'top',
      language,
      currency,
      country: countryCode,
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imgRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      imgRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const convertAndFormat = (jpy: number) => {
    const rate = rates[currency] ?? 1;
    const raw = currency === "JPY" ? jpy : jpy * rate;
    const withVAT = isEU ? raw * 1.20 : raw;
    const converted = applyPsychologicalPrice(withVAT, currency);
    return formatPrice(converted, currency);
  };

  return (
    <div className="min-h-screen bg-black">
      <JsonLd type="Organization" data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "TCDA",
        "legalName": "Transcend Creative Dimension Aura",
        "url": "https://tcdashop.com",
        "logo": "https://cdn.tcdashop.com/logo/1.webp",
        "sameAs": [
          "https://www.instagram.com/tcda.shop/",
          "https://www.tiktok.com/@tcda.shop",
          "https://jp.pinterest.com/tcda_shop/",
          "https://x.com/tcda_shop"
        ]
      }} />
      <JsonLd type="WebSite" data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TCDA",
        "url": "https://tcdashop.com"
      }} />

      {/* SECTION 1 — TRANSCEND */}
      <section className="relative h-screen w-full overflow-hidden">
        <img
          ref={imgRef}
          src={HERO_IMAGE}
          srcSet="https://cdn.tcdashop.com/top/1-mobile.webp 550w, https://cdn.tcdashop.com/top/1.webp 902w"
          sizes="(max-width: 768px) 550px, 902px"
          alt="TCDA"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={{ willChange: "transform", transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            {...fadeUp}
            className="text-white text-center leading-none select-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 15vw, 200px)" }}
          >
            TRANSCEND
          </motion.h1>
        </div>
      </section>

      {/* SECTION 2 — CREATIVE */}
      <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <motion.h2
          {...fadeUp}
          className="text-center leading-none select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 15vw, 200px)", color: "#E8FF00" }}
        >
          CREATIVE
        </motion.h2>
      </section>

      {/* SECTION 3 — DIMENSION */}
      <section className="relative h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center gap-8">
        <motion.h2
          {...fadeUp}
          className="text-white text-center leading-none select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 15vw, 200px)" }}
        >
          DIMENSION
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "18px", color: "rgba(255,255,255,0.5)" }}
        >
          Art-driven fashion for those who refuse the ordinary.
        </motion.p>
      </section>

      {/* SECTION 4 — AURA */}
      <section className="relative h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center gap-12">
        <motion.h2
          {...fadeUp}
          className="text-white text-center leading-none select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 15vw, 200px)" }}
        >
          AURA
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center gap-4"
        >
          {geo === "JP" && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, opacity: 0.5, color: "#ffffff" }}>
              {ti18n("geo.jp.topBanner")}
            </p>
          )}
          {geo === "EU" && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, opacity: 0.5, color: "#ffffff" }}>
              {ti18n("geo.eu.topBanner")}
            </p>
          )}
          {geo === "US" && (
            <Link
              to={`/${language}/collection`}
              className="inline-block px-8 py-3 bg-[#E8FF00] text-black hover:bg-white transition-colors duration-300"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px" }}
            >
              Shop Now
            </Link>
          )}
          <Link
            to={`/${language}/collection`}
            className="inline-block px-8 py-3 border border-[#E8FF00] text-[#E8FF00] hover:bg-[#E8FF00] hover:text-black transition-colors duration-300"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px" }}
          >
            Shop Now
          </Link>
        </motion.div>
      </section>

      {/* COLLECTION GRID */}
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
          <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: "2px" }}>
            {products.slice(0, 6).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/${language}/product/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-white/5 mb-4">
                    <ImageWithFallback
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                      <span className="text-white text-[11px] tracking-[0.3em] uppercase border-b border-[#E8FF00] pb-px">
                        View
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-white/70 text-[10px] tracking-[0.3em] uppercase group-hover:text-white transition-colors duration-300">
                      {product.name}
                    </p>
                    <p className="text-[#E8FF00] text-sm tracking-wider">
                      {convertAndFormat(product.price)}
                    </p>
                    {isEU && (
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", opacity: 0.5, color: "white" }}>
                        Price includes VAT
                      </p>
                    )}
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
