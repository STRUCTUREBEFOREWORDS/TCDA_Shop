import { motion } from "motion/react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 } as Record<string, unknown>,
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};

const WHO = [
  {
    label: "The Individual",
    body: "Someone who refuses to dress like everyone else.",
  },
  {
    label: "The Art Seeker",
    body: "Someone who finds meaning in visual expression.",
  },
  {
    label: "The Self-Transformer",
    body: "Someone in the process of becoming.",
  },
];

const DIFFERENT = [
  {
    title: "Art-First Design",
    body: "Every piece starts as a visual concept, not a product.",
  },
  {
    title: "Limited Feeling",
    body: "Not mass. Not fast. Designed to feel rare.",
  },
  {
    title: "Wearable Identity",
    body: "Clothing as a form of self-declaration.",
  },
];

const sectionPad = "py-[120px] px-12 max-md:py-[60px] max-md:px-5";

export function BrandFoundationPage() {
  const { language } = useGlobalContext();

  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <title>Brand Foundation — TCDA</title>
        <meta name="description" content="What TCDA stands for. Art-first fashion for those who refuse the ordinary." />
      </Helmet>

      {/* 1. Hero */}
      <section className="relative flex flex-col items-center justify-center text-center" style={{ height: "80vh" }}>
        <motion.h1
          {...fadeUp}
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 96px)", color: "#ffffff", lineHeight: 1 }}
        >
          WHAT WE STAND FOR
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-5"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", opacity: 0.5, color: "#ffffff" }}
        >
          Transcend Creative Dimension Aura
        </motion.p>
      </section>

      {/* 2. What TCDA Is */}
      <section className={`${sectionPad} border-t border-white/5`}>
        <div className="max-w-3xl mx-auto">
          <motion.h2
            {...fadeUp}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: "#E8FF00", marginBottom: "40px" }}
          >
            WHAT TCDA IS
          </motion.h2>
          <motion.p
            {...fadeUp}
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "18px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}
          >
            TCDA — Transcend Creative Dimension Aura — is a brand born at the intersection of digital art and wearable culture.
            Every design begins as a visual concept, created to carry meaning beyond aesthetics.
            We exist for those who refuse the ordinary: the ones who see fashion not as a uniform, but as a declaration.
          </motion.p>
        </div>
      </section>

      {/* 3. Who It Is For */}
      <section className={`${sectionPad} border-t border-white/5`}>
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUp}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: "#ffffff", marginBottom: "60px" }}
          >
            WHO IT IS FOR
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {WHO.map(({ label, body }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <p
                  className="mb-3"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: "#E8FF00", letterSpacing: "0.05em" }}
                >
                  {label}
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. What Makes TCDA Different */}
      <section className={`${sectionPad} border-t border-white/5`}>
        <div className="max-w-5xl mx-auto">
          <motion.h2
            {...fadeUp}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: "#ffffff", marginBottom: "60px" }}
          >
            WHAT MAKES TCDA DIFFERENT
          </motion.h2>
          <div className="flex flex-col gap-16">
            {DIFFERENT.map(({ title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`flex flex-col md:flex-row gap-8 ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="md:w-1/2 border-l-2 border-[#E8FF00] pl-6">
                  <p
                    className="mb-2"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "#ffffff", letterSpacing: "0.05em" }}
                  >
                    {title}
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
                    {body}
                  </p>
                </div>
                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Product Philosophy */}
      <section className={`${sectionPad} border-t border-white/5`}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            {...fadeUp}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: "#E8FF00", marginBottom: "40px" }}
          >
            PRODUCT PHILOSOPHY
          </motion.h2>
          <motion.p
            {...fadeUp}
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "20px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontStyle: "italic" }}
          >
            "We don't make clothes. We make artifacts of personal transformation."
          </motion.p>
        </div>
      </section>

      {/* 6. Common Questions CTA */}
      <section className={`${sectionPad} border-t border-white/5 text-center`}>
        <motion.div {...fadeUp}>
          <p
            className="mb-8"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", color: "#ffffff" }}
          >
            HAVE QUESTIONS?
          </p>
          <Link
            to={`/${language}/faq`}
            className="inline-block px-10 py-3 border border-[#E8FF00] text-[#E8FF00] hover:bg-[#E8FF00] hover:text-black transition-colors duration-300"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "0.1em" }}
          >
            READ THE FAQ
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
