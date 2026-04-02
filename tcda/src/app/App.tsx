import { useState, useRef } from 'react';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Archive } from './components/Archive';
import { ProductGrid } from './components/ProductGrid';
import { About } from './components/About';
import { ProductModal } from './components/ProductModal';
import { Product } from './components/ProductCard';
export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (section: string) => {
    const refs = {
      hero: heroRef,
      archive: archiveRef,
      shop: shopRef,
      about: aboutRef,
    };

    refs[section as keyof typeof refs]?.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const handleScrollToShop = () => {
    shopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AppProvider>
      <div className="bg-white">
        {/* Navigation */}
        <Navigation onNavigate={handleNavigate} />

        {/* Hero Section */}
        <div ref={heroRef}>
          <Hero onScrollClick={handleScrollToShop} />
        </div>

        {/* Archive Section */}
        <div ref={archiveRef}>
          <Archive />
        </div>

        {/* Product Grid (Shop) */}
        <div ref={shopRef}>
          <ProductGrid onProductClick={setSelectedProduct} />
        </div>

        {/* About Section */}
        <div ref={aboutRef}>
          <About />
        </div>

        {/* Product Modal */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </AppProvider>
  );
}
