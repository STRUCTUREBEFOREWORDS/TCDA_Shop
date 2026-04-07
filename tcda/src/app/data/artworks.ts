export interface ArtworkData {
  id: string;
  name: {
    en: string;
    ja: string;
    fr: string;
  };
  shortName: string;
  imageUrl: string;
  heroPhilosophicalKey: "heroPhilosophical1" | "heroPhilosophical2" | "heroPhilosophical3";
  emotionKey: "emotion1" | "emotion2" | "emotion3";
  identityKey: "identity1" | "identity2" | "identity3";
  title: {
    en: string;
    ja: string;
    fr: string;
  };
  concept: {
    en: string;
    ja: string;
    fr: string;
  };
  colorPalette: string[];
  price: {
    USD: number;
    JPY: number;
    EUR: number;
    GBP: number;
  };
}

export const artworks: ArtworkData[] = [
  {
    id: "dissonance-01",
    name: {
      en: "Dissonance — No. 01",
      ja: "ディソナンス — No. 01",
      fr: "Dissonance — No. 01",
    },
    shortName: "No. 01",
    imageUrl:
      "https://images.unsplash.com/photo-1606622683770-4bca744e9c01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGZhc2hpb24lMjBhcnQlMjBtaW5pbWFsaXN0fGVufDF8fHx8MTc3NTA5MzcxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    heroPhilosophicalKey: "heroPhilosophical1",
    emotionKey: "emotion1",
    identityKey: "identity1",
    title: {
      en: "Dissonance — No. 01",
      ja: "ディソナンス — No. 01",
      fr: "Dissonance — No. 01",
    },
    concept: {
      en: "Internal conflict rendered through intersecting color fields. The tension between who you are and who the world expects you to be.",
      ja: "交差する色面を通じて表現された内的葛藤。あなた自身と世界が期待するあなたの間の緊張。",
      fr: "Conflit intérieur rendu à travers des champs de couleur qui se croisent. La tension entre qui vous êtes et qui le monde attend que vous soyez.",
    },
    colorPalette: ["#1a1a2e", "#e94560", "#0f3460", "#16213e", "#f4f4f4"],
    price: {
      USD: 420,
      JPY: 62000,
      EUR: 390,
      GBP: 335,
    },
  },
  {
    id: "void-02",
    name: {
      en: "Void — No. 02",
      ja: "ヴォイド — No. 02",
      fr: "Vide — No. 02",
    },
    shortName: "No. 02",
    imageUrl:
      "https://images.unsplash.com/photo-1618037087830-5e746497905b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdm9pZCUyMGFic3RyYWN0JTIwYmxhY2slMjB3aGl0ZXxlbnwxfHx8fDE3NzUwOTM5NjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    heroPhilosophicalKey: "heroPhilosophical2",
    emotionKey: "emotion2",
    identityKey: "identity2",
    title: {
      en: "Void — No. 02",
      ja: "ヴォイド — No. 02",
      fr: "Vide — No. 02",
    },
    concept: {
      en: "Negative space as generative force. The productive potential of absence, silence, and the in-between.",
      ja: "生成力としてのネガティブスペース。不在、沈黙、そして中間の生産的可能性。",
      fr: "L'espace négatif comme force génératrice. Le potentiel productif de l'absence, du silence et de l'entre-deux.",
    },
    colorPalette: ["#0a0a0a", "#f5f5f5", "#4a4a4a", "#c0c0c0", "#2d2d2d"],
    price: {
      USD: 450,
      JPY: 66000,
      EUR: 420,
      GBP: 360,
    },
  },
  {
    id: "dissolution-03",
    name: {
      en: "Dissolution — No. 03",
      ja: "ディソリューション — No. 03",
      fr: "Dissolution — No. 03",
    },
    shortName: "No. 03",
    imageUrl:
      "https://images.unsplash.com/photo-1609796923268-b3941e54a144?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXF1aWQlMjBkaXNzb2x1dGlvbiUyMGNvbG9yJTIwYWJzdHJhY3QlMjBhcnR8ZW58MXx8fHwxNzc1MDkzOTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    heroPhilosophicalKey: "heroPhilosophical3",
    emotionKey: "emotion3",
    identityKey: "identity3",
    title: {
      en: "Dissolution — No. 03",
      ja: "ディソリューション — No. 03",
      fr: "Dissolution — No. 03",
    },
    concept: {
      en: "The moment identity becomes liquid. Transformation, release, and the surrender of fixed form.",
      ja: "アイデンティティが液体になる瞬間。変容、解放、固定形式の放棄。",
      fr: "Le moment où l'identité devient liquide. Transformation, libération et abandon de la forme fixe.",
    },
    colorPalette: ["#1c1c3a", "#6b5b95", "#feb236", "#d64161", "#ff7b25"],
    price: {
      USD: 480,
      JPY: 71000,
      EUR: 450,
      GBP: 385,
    },
  },
];