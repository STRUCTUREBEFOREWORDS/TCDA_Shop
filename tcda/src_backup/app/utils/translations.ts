type Language = 'en' | 'es' | 'fr' | 'ja';

type Translations = {
  [key: string]: {
    [lang in Language]: string;
  };
};

export const translations: Translations = {
  // Product tags
  SILENCE: {
    en: 'SILENCE',
    es: 'SILENCIO',
    fr: 'SILENCE',
    ja: '静寂',
  },
  IMPULSE: {
    en: 'IMPULSE',
    es: 'IMPULSO',
    fr: 'IMPULSION',
    ja: '衝動',
  },
  ESSENCE: {
    en: 'ESSENCE',
    es: 'ESENCIA',
    fr: 'ESSENCE',
    ja: '本質',
  },
  FLOW: {
    en: 'FLOW',
    es: 'FLUIR',
    fr: 'FLUX',
    ja: '流れ',
  },
  ENERGY: {
    en: 'ENERGY',
    es: 'ENERGÍA',
    fr: 'ÉNERGIE',
    ja: 'エネルギー',
  },
  GRACE: {
    en: 'GRACE',
    es: 'GRACIA',
    fr: 'GRÂCE',
    ja: '優雅',
  },
  AURA: {
    en: 'AURA',
    es: 'AURA',
    fr: 'AURA',
    ja: 'オーラ',
  },
  CLARITY: {
    en: 'CLARITY',
    es: 'CLARIDAD',
    fr: 'CLARTÉ',
    ja: '明瞭',
  },
  VISION: {
    en: 'VISION',
    es: 'VISIÓN',
    fr: 'VISION',
    ja: 'ビジョン',
  },
  // UI elements
  VIEW: {
    en: 'VIEW',
    es: 'VER',
    fr: 'VOIR',
    ja: '見る',
  },
  SELECT_SIZE: {
    en: 'SELECT SIZE',
    es: 'SELECCIONAR TALLA',
    fr: 'SÉLECTIONNER TAILLE',
    ja: 'サイズを選択',
  },
  ADD_TO_CART: {
    en: 'ADD TO CART',
    es: 'AÑADIR AL CARRITO',
    fr: 'AJOUTER AU PANIER',
    ja: 'カートに追加',
  },
  BUY_NOW: {
    en: 'BUY NOW',
    es: 'COMPRAR AHORA',
    fr: 'ACHETER',
    ja: '今すぐ購入',
  },
  DETAILS: {
    en: 'DETAILS',
    es: 'DETALLES',
    fr: 'DÉTAILS',
    ja: '詳細',
  },
  PRODUCT: {
    en: 'PRODUCT',
    es: 'PRODUCTO',
    fr: 'PRODUIT',
    ja: '商品',
  },
  SIZE_GUIDE: {
    en: 'SIZE',
    es: 'TALLA',
    fr: 'TAILLE',
    ja: 'サイズ',
  },
  CHECKOUT: {
    en: 'CHECKOUT',
    es: 'PAGAR',
    fr: 'PAIEMENT',
    ja: '決済',
  },
  TOTAL: {
    en: 'TOTAL',
    es: 'TOTAL',
    fr: 'TOTAL',
    ja: '合計',
  },
  SIZE: {
    en: 'Size',
    es: 'Talla',
    fr: 'Taille',
    ja: 'サイズ',
  },
  CHEST: {
    en: 'Chest',
    es: 'Pecho',
    fr: 'Poitrine',
    ja: '胸囲',
  },
  WAIST: {
    en: 'Waist',
    es: 'Cintura',
    fr: 'Taille',
    ja: 'ウエスト',
  },
  LENGTH: {
    en: 'Length',
    es: 'Largo',
    fr: 'Longueur',
    ja: '着丈',
  },
  MODEL_HEIGHT: {
    en: 'Model height',
    es: 'Altura modelo',
    fr: 'Taille mannequin',
    ja: 'モデル身長',
  },
  WEARING_SIZE: {
    en: 'Wearing size',
    es: 'Talla usado',
    fr: 'Porte la taille',
    ja: '着用サイズ',
  },
  FIT: {
    en: 'Regular fit, true to size',
    es: 'Ajuste regular, fiel al tamaño',
    fr: 'Coupe régulière, taille normale',
    ja: 'レギュラーフィット、実寸通り',
  },
};

export function t(key: string, language: Language): string {
  return translations[key]?.[language] || key;
}
