export const colors = {
  background:      "#000000",
  text:            "#ffffff",
  textMuted:       "rgba(255,255,255,0.7)",
  accent:          "#E8FF00",
  accentSecondary: "#FF3D00",
  grainOverlay:    "rgba(255,255,255,0.035)",
} as const;

export const fonts = {
  display: "'Cormorant Garamond', serif",
  body:    "'Inter', sans-serif",
} as const;

export const spacing = {
  sectionY:   "120px",
  containerX: "48px",
  cardGap:    "2px",
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
  duration:  "0.4s",
  easing:    "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  cardScale: "1.06",
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
