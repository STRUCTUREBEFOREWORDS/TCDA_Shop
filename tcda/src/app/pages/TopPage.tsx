import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { useGlobalContext } from "./Root";
import { JsonLd } from "../components/JsonLd";
import { pushDataLayer } from "../hooks/useDataLayer";

const HERO_IMAGE = "https://cdn.tcdashop.com/top/hero-transcend.webp";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 } as Record<string, unknown>,
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};

export function TopPage() {
  const { language, currency, countryCode } = useGlobalContext();

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
          srcSet="https://cdn.tcdashop.com/top/hero-transcend.webp 902w"
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
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 18vw, 200px)" }}
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
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 18vw, 200px)", color: "#E8FF00" }}
        >
          CREATIVE
        </motion.h2>
      </section>

      {/* SECTION 3 — DIMENSION */}
      <section className="relative h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center gap-8">
        <motion.h2
          {...fadeUp}
          className="text-white text-center leading-none select-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 18vw, 200px)" }}
        >
          DIMENSION
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", color: "rgba(255,255,255,0.5)" }}
        >
          Art-driven fashion for those who refuse the ordinary.
        </motion.p>
      </section>

      {/* SECTION 4 — AURA */}
      <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <motion.h2
          {...fadeUp}
          className="text-white text-center leading-none select-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 18vw, 200px)" }}
        >
          AURA
        </motion.h2>
      </section>
    </div>
  );
}
