import { motion } from 'motion/react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { SizeChart } from '../data/products';

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  tag: string;
  description: string;
  sizes: string[];
  sizeChart: SizeChart[];
  printful_product_id?: number;
  images?: string[];
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
}

export function ProductCard({ product, onClick, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { language, convertPrice, getCurrencySymbol } = useApp();

  const translatedTag = t(product.tag, language);
  const translatedView = t('VIEW', language);
  const displayPrice = convertPrice(product.price);
  const symbol = getCurrencySymbol();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
      className="group relative cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <motion.img
          src={product.image}
          alt={product.tag}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Hover Overlay — desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-0 hidden items-center justify-center bg-black/40 sm:flex"
        >
          <div className="text-center px-4">
            <p className="mb-4 text-xs leading-relaxed tracking-widest text-white">
              {product.description}
            </p>
            <span className="border border-white px-6 py-3 text-xs tracking-widest text-white">
              {translatedView}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4">
        <p className="text-xs tracking-[0.2em] text-neutral-400 truncate">{translatedTag}</p>
        <p className="shrink-0 text-sm">{symbol}{displayPrice}</p>
      </div>
    </motion.div>
  );
}
