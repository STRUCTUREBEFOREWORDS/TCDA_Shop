import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { ProductCard, Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
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
