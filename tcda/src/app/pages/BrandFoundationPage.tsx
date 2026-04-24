import { useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useGlobalContext } from "./Root";
import { pushDataLayer } from "../hooks/useDataLayer";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 } as Record<string, unknown>,
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
};

const SECTION_NUM_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "40px",
  left: "var(--container-padding-desktop)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-caption)",
  letterSpacing: "var(--ls-nav)",
  color: "var(--color-text-tertiary)",
};

const SECTION_STYLE: React.CSSProperties = {
  borderTop: "1px solid var(--color-border)",
  paddingTop: "80px",
  marginTop: "80px",
  position: "relative",
};

const WHO = [
  { label: "The Individual", body: "Someone who refuses to dress like everyone else." },
  { label: "The Art Seeker", body: "Someone who finds meaning in visual expression." },
  { label: "The Self-Transformer", body: "Someone in the process of becoming." },
];

const DIFFERENT = [
  { title: "Art-First Design", body: "Every piece starts as a visual concept, not a product." },
  { title: "Limited Feeling", body: "Not mass. Not fast. Designed to feel rare." },
  { title: "Wearable Identity", body: "Clothing as a form of self-declaration." },
];

export function BrandFoundationPage() {
  const { language, currency, countryCode } = useGlobalContext();

  useEffect(() => {
    pushDataLayer('page_view', {
      page_type: 'brand_foundation',
      language,
      currency,
      country: countryCode,
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Helmet>
        <title>Brand Foundation — TCDA</title>
        <meta name="description" content="What TCDA stands for. Art-first fashion for those who refuse the ordinary." />
      </Helmet>

      {/* 01. Hero */}
      <section
        className="relative flex flex-col justify-end items-start"
        style={{
          height: "80vh",
          padding: "0 var(--container-padding-desktop) var(--section-padding-desktop)",
        }}
      >
        <span style={SECTION_NUM_STYLE}>01</span>
        <motion.h1
          {...fadeUp}
          className="leading-[1.2]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-display)",
            fontWeight: "var(--weight-light)",
            letterSpacing: "var(--ls-display)",
            color: "var(--color-text)",
          }}
        >
          WHAT WE STAND FOR
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-5"
          style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "var(--color-text-tertiary)" }}
        >
          Transcend Creative Dimension Aura
        </motion.p>
      </section>

      {/* Content container */}
      <div
        style={{
          maxWidth: "var(--max-width-content)",
          margin: "0 auto",
          padding: "0 var(--container-padding-desktop)",
        }}
      >
        {/* 02. What TCDA Is */}
        <section style={SECTION_STYLE}>
          <span style={SECTION_NUM_STYLE}>02</span>
          <motion.h2
            {...fadeUp}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-subheading)",
              fontWeight: "var(--weight-light)",
              letterSpacing: "var(--ls-display)",
              color: "var(--color-accent)",
              marginBottom: "40px",
            }}
          >
            WHAT TCDA IS
          </motion.h2>
          <motion.p
            {...fadeUp}
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, letterSpacing: "var(--ls-body)" }}
          >
            TCDA — Transcend Creative Dimension Aura — is a brand born at the intersection of digital art and wearable culture.
            Every design begins as a visual concept, created to carry meaning beyond aesthetics.
            We exist for those who refuse the ordinary: the ones who see fashion not as a uniform, but as a declaration.
          </motion.p>
        </section>

        {/* 03. Who It Is For */}
        <section style={SECTION_STYLE}>
          <span style={SECTION_NUM_STYLE}>03</span>
          <motion.h2
            {...fadeUp}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-subheading)",
              fontWeight: "var(--weight-light)",
              letterSpacing: "var(--ls-display)",
              color: "var(--color-text)",
              marginBottom: "40px",
            }}
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
                  style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-subheading)", fontWeight: "var(--weight-light)", letterSpacing: "var(--ls-display)", color: "var(--color-accent)" }}
                >
                  {label}
                </p>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, letterSpacing: "var(--ls-body)" }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 04. What Makes TCDA Different */}
        <section style={SECTION_STYLE}>
          <span style={SECTION_NUM_STYLE}>04</span>
          <motion.h2
            {...fadeUp}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-subheading)",
              fontWeight: "var(--weight-light)",
              letterSpacing: "var(--ls-display)",
              color: "var(--color-text)",
              marginBottom: "40px",
            }}
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
                <div className="md:w-1/2 pl-6" style={{ borderLeft: "2px solid var(--color-accent)" }}>
                  <p
                    className="mb-2"
                    style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-subheading)", fontWeight: "var(--weight-light)", letterSpacing: "var(--ls-display)", color: "var(--color-text)" }}
                  >
                    {title}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, letterSpacing: "var(--ls-body)" }}>
                    {body}
                  </p>
                </div>
                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* 05. Product Philosophy */}
        <section style={SECTION_STYLE}>
          <span style={SECTION_NUM_STYLE}>05</span>
          <motion.h2
            {...fadeUp}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-subheading)",
              fontWeight: "var(--weight-light)",
              letterSpacing: "var(--ls-display)",
              color: "var(--color-accent)",
              marginBottom: "40px",
            }}
          >
            PRODUCT PHILOSOPHY
          </motion.h2>
          <motion.p
            {...fadeUp}
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: 1.8, fontStyle: "italic", letterSpacing: "var(--ls-body)" }}
          >
            "We don't make clothes. We make artifacts of personal transformation."
          </motion.p>
        </section>

        {/* 06. CTA */}
        <section
          style={{
            ...SECTION_STYLE,
            marginBottom: "160px",
            textAlign: "center",
          }}
        >
          <span style={SECTION_NUM_STYLE}>06</span>
          <motion.div {...fadeUp}>
            <p
              className="mb-8"
              style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-subheading)", fontWeight: "var(--weight-light)", letterSpacing: "var(--ls-display)", color: "var(--color-text)" }}
            >
              HAVE QUESTIONS?
            </p>
            <Link
              to={`/${language}/faq`}
              className="inline-block px-10 py-3 uppercase"
              style={{
                border: "1px solid var(--color-accent)",
                color: "var(--color-accent)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-caption)",
                letterSpacing: "var(--ls-nav)",
                transition: "var(--transition-base)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-accent)";
                e.currentTarget.style.color = "var(--color-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--color-accent)";
              }}
            >
              READ THE FAQ
            </Link>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
