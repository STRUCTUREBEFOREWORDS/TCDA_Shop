import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { ProductCard, Product } from './ProductCard';
import { useProducts } from '../hooks/useProducts';

interface ProductGridProps {
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ onProductClick }: ProductGridProps) {
  const { products, loading, error } = useProducts();

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
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 640: 2, 1024: 3, 1536: 4 }}
      >
        <Masonry gutter="24px">
          {products.map((product, index) => (
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
