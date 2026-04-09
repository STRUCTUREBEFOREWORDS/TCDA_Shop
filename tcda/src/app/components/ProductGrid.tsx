import { useState } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { ProductCard, Product } from './ProductCard';
import { useProducts } from '../hooks/useProducts';
type Category = 'ALL' | 'HOODIE' | 'ZIP HOODIE' | 'T-SHIRT';
const CATEGORIES: Category[] = ['ALL', 'HOODIE', 'ZIP HOODIE', 'T-SHIRT'];
function getCategory(name: string): Category {
  const n = name.toLowerCase();
  if (n.includes('zip')) return 'ZIP HOODIE';
  if (n.includes('hoodie')) return 'HOODIE';
  if (n.includes('t-shirt') || n.includes('tshirt')) return 'T-SHIRT';
  return 'ALL';
}
interface ProductGridProps {
  onProductClick: (product: Product) => void;
}
export function ProductGrid({ onProductClick }: ProductGridProps) {
  const { products, loading, error } = useProducts();
  const [active, setActive] = useState<Category>('ALL');
  const filtered = active === 'ALL'
    ? products
    : products.filter((p) => getCategory(p.name) === active);
  if (loading) {
    return (
      <section className="min-h-screen bg-white px-4 py-20 md:px-8 md:py-24">
        <p className="text-center text-gray-500">読み込み中...</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="min-h-screen bg-white px-4 py-20 md:px-8 md:py-24">
        <p className="text-center text-red-500">商品を読み込めませんでした</p>
      </section>
    );
  }
  return (
    <section className="min-h-screen bg-white px-4 py-20 md:px-8 md:py-24">
      <div className="flex gap-2 mb-10 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 text-xs tracking-widest border transition-colors whitespace-nowrap min-h-[44px] ${
              active === cat
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-black hover:bg-black hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2, 1024: 3, 1536: 4 }}>
        <Masonry gutter="24px">
          {filtered.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
              index={index}
            />
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </section>
  );
}
