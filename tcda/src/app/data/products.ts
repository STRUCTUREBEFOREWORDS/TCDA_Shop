import { Product } from '../components/ProductCard';

export interface SizeChart {
  size: string;
  chest: number;
  waist: number;
  length: number;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Minimal Overcoat',
    image: 'https://images.unsplash.com/photo-1764698072926-8d3bd4908cdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZmFzaGlvbiUyMHBvcnRyYWl0JTIwYmxhY2t8ZW58MXx8fHwxNzc0NzgyODA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 485,
    tag: 'SILENCE',
    description: 'Minimal Form',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sizeChart: [
      { size: 'XS', chest: 88, waist: 74, length: 74 },
      { size: 'S', chest: 92, waist: 78, length: 76 },
      { size: 'M', chest: 96, waist: 82, length: 78 },
      { size: 'L', chest: 100, waist: 86, length: 80 },
      { size: 'XL', chest: 104, waist: 90, length: 82 },
    ],
  },
  {
    id: '2',
    name: 'Avant Structure Jacket',
    image: 'https://images.unsplash.com/photo-1760518221657-4cc66c12f68b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmFudCUyMGdhcmRlJTIwZmFzaGlvbiUyMGVkaXRvcmlhbHxlbnwxfHx8fDE3NzQ2OTMyMjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 720,
    tag: 'IMPULSE',
    description: 'Bold Vision',
    sizes: ['S', 'M', 'L', 'XL'],
    sizeChart: [
      { size: 'S', chest: 94, waist: 80, length: 68 },
      { size: 'M', chest: 98, waist: 84, length: 70 },
      { size: 'L', chest: 102, waist: 88, length: 72 },
      { size: 'XL', chest: 106, waist: 92, length: 74 },
    ],
  },
  {
    id: '3',
    name: 'Monochrome Draped Coat',
    image: 'https://images.unsplash.com/photo-1680789526833-9b09dee3d68e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwbW9ub2Nocm9tZXxlbnwxfHx8fDE3NzQ3ODI4MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 890,
    tag: 'ESSENCE',
    description: 'Pure Luxury',
    sizes: ['XS', 'S', 'M', 'L'],
    sizeChart: [
      { size: 'XS', chest: 86, waist: 72, length: 110 },
      { size: 'S', chest: 90, waist: 76, length: 112 },
      { size: 'M', chest: 94, waist: 80, length: 114 },
      { size: 'L', chest: 98, waist: 84, length: 116 },
    ],
  },
  {
    id: '4',
    name: 'Contemporary Silk Dress',
    image: 'https://images.unsplash.com/photo-1726128449240-6569b63355d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBmYXNoaW9uJTIwZGVzaWdufGVufDF8fHx8MTc3NDc4MjgwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 595,
    tag: 'FLOW',
    description: 'Fluid Motion',
    sizes: ['S', 'M', 'L', 'XL'],
    sizeChart: [
      { size: 'S', chest: 86, waist: 68, length: 118 },
      { size: 'M', chest: 90, waist: 72, length: 120 },
      { size: 'L', chest: 94, waist: 76, length: 122 },
      { size: 'XL', chest: 98, waist: 80, length: 124 },
    ],
  },
  {
    id: '5',
    name: 'Tailored Power Suit',
    image: 'https://images.unsplash.com/photo-1546178255-07780cda8f89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3NDc4MjgwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 1250,
    tag: 'ENERGY',
    description: 'Power Stance',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sizeChart: [
      { size: 'XS', chest: 84, waist: 68, length: 72 },
      { size: 'S', chest: 88, waist: 72, length: 74 },
      { size: 'M', chest: 92, waist: 76, length: 76 },
      { size: 'L', chest: 96, waist: 80, length: 78 },
      { size: 'XL', chest: 100, waist: 84, length: 80 },
    ],
  },
  {
    id: '6',
    name: 'Artistic Linen Blend',
    image: 'https://images.unsplash.com/photo-1633588566108-60b5ed39f16d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3RpYyUyMGZhc2hpb24lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ2ODkxNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 675,
    tag: 'GRACE',
    description: 'Timeless',
    sizes: ['S', 'M', 'L'],
    sizeChart: [
      { size: 'S', chest: 90, waist: 74, length: 68 },
      { size: 'M', chest: 94, waist: 78, length: 70 },
      { size: 'L', chest: 98, waist: 82, length: 72 },
    ],
  },
  {
    id: '7',
    name: 'Modern Edge Blazer',
    image: 'https://images.unsplash.com/photo-1742631193849-acc045ea5890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBmYXNoaW9uJTIwZWxlZ2FuY2V8ZW58MXx8fHwxNzc0NzgyODA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 540,
    tag: 'AURA',
    description: 'Modern Edge',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sizeChart: [
      { size: 'XS', chest: 86, waist: 72, length: 66 },
      { size: 'S', chest: 90, waist: 76, length: 68 },
      { size: 'M', chest: 94, waist: 80, length: 70 },
      { size: 'L', chest: 98, waist: 84, length: 72 },
      { size: 'XL', chest: 102, waist: 88, length: 74 },
    ],
  },
  {
    id: '8',
    name: 'Clean Line Trench',
    image: 'https://images.unsplash.com/photo-1635279474047-ab3cda78bbe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcnVud2F5JTIwbWluaW1hbHxlbnwxfHx8fDE3NzQ3ODI4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 820,
    tag: 'CLARITY',
    description: 'Clean Lines',
    sizes: ['S', 'M', 'L', 'XL'],
    sizeChart: [
      { size: 'S', chest: 92, waist: 78, length: 102 },
      { size: 'M', chest: 96, waist: 82, length: 104 },
      { size: 'L', chest: 100, waist: 86, length: 106 },
      { size: 'XL', chest: 104, waist: 90, length: 108 },
    ],
  },
  {
    id: '9',
    name: 'Couture Statement Piece',
    image: 'https://images.unsplash.com/photo-1768885560804-637950eb129d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3V0dXJlJTIwZmFzaGlvbiUyMGFydGlzdGljfGVufDF8fHx8MTc3NDc4MjgwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 1450,
    tag: 'VISION',
    description: 'Art Form',
    sizes: ['XS', 'S', 'M', 'L'],
    sizeChart: [
      { size: 'XS', chest: 82, waist: 66, length: 116 },
      { size: 'S', chest: 86, waist: 70, length: 118 },
      { size: 'M', chest: 90, waist: 74, length: 120 },
      { size: 'L', chest: 94, waist: 78, length: 122 },
    ],
  },
];