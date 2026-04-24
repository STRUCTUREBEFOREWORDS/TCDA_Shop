export const colors = {
  background:    "#000000",
  text:          "#ffffff",
  textMuted:     "rgba(255,255,255,0.7)",
  textSecondary: "rgba(255,255,255,0.7)",
  textTertiary:  "rgba(255,255,255,0.4)",
  accent:          "#E8FF00",
  accentHover:     "rgba(232,255,0,0.8)",
  accentSecondary: "#FF3D00",
  border:        "rgba(255,255,255,0.12)",
  surface:       "rgba(255,255,255,0.04)",
  grainOverlay:  "rgba(255,255,255,0.035)",
} as const;

export const fonts = {
  display: "'Cormorant Garamond', serif",
  body:    "'Inter', sans-serif",
} as const;

export const spacing = {
  sectionY:   "120px",
  containerX: "48px",
  cardGap:    "2px",
  sectionPadding: { desktop: "120px", mobile: "80px" },
  containerPadding: { desktop: "80px", tablet: "40px", mobile: "20px" },
  maxWidth: { content: "1200px", container: "1440px" },
  gap: { grid: "24px", card: "20px" },
} as const;

export const typography = {
  display: {
    fontFamily:    "'Cormorant Garamond', serif",
    size:          "clamp(48px, 8vw, 120px)",
    weight:        300,
    letterSpacing: "0.05em",
  },
  heading: {
    fontFamily:    "'Cormorant Garamond', serif",
    size:          "clamp(32px, 5vw, 64px)",
    weight:        300,
    letterSpacing: "0.05em",
  },
  subheading: {
    fontFamily:    "'Cormorant Garamond', serif",
    size:          "clamp(20px, 3vw, 32px)",
    weight:        400,
    letterSpacing: "0.05em",
  },
  body: {
    fontFamily:    "'Inter', sans-serif",
    size:          "16px",
    weight:        300,
    letterSpacing: "0.02em",
  },
  caption: {
    fontFamily:    "'Inter', sans-serif",
    size:          "12px",
    weight:        400,
    letterSpacing: "0.15em",
  },
} as const;

export const fontSizes = {
  hero:  "clamp(64px, 12vw, 160px)",
  h1:    "clamp(40px, 6vw, 80px)",
  h2:    "clamp(28px, 4vw, 48px)",
  h3:    "24px",
  body:  "16px",
  small: "13px",
  label: "11px",
} as const;

export const animation = {
  duration:       "0.4s",
  easing:         "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  cardScale:      "1.06",
  transitionBase: "0.3s ease",
  transitionSlow: "0.6s ease",
} as const;

export const breakpoints = {
  mobile:  "768px",
  tablet:  "1024px",
  desktop: "1280px",
} as const;

export const grid = {
  full:    "1fr",
  half:    "1fr 1fr",
  thirds:  "1fr 1fr 1fr",
  cardGap: "2px",
} as const;
