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
      <motion.div
        className="relative overflow-hidden"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <img
          src={product.image}
          alt={product.tag}
          className="h-full w-full object-cover"
        />

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center bg-black/40"
        >
          <div className="text-center">
            <p className="mb-4 text-sm tracking-widest text-white">
              {product.description}
            </p>
            <button className="border border-white px-8 py-3 text-xs tracking-widest text-white transition-colors hover:bg-white hover:text-black">
              {translatedView}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Product Info (Always Visible) */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs tracking-[0.2em] text-neutral-400">{translatedTag}</p>
        <p className="text-sm">{symbol}{displayPrice}</p>
      </div>
    </motion.div>
  );
}