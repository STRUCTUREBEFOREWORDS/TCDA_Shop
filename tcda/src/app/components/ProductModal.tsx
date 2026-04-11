import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Product } from './ProductCard';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { redirectToCheckout } from '../utils/stripe';
import { SizeChartTable } from './SizeChartTable';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

type Tab = 'product' | 'size';

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('product');
  const [isProcessing, setIsProcessing] = useState(false);

  const { language, convertPrice, getCurrencySymbol, currency } = useApp();

  if (!product) return null;

  const displayPrice = convertPrice(product.price);
  const symbol = getCurrencySymbol();
  const translatedTag = t(product.tag, language);

  const handleBuyNow = async () => {
    if (!selectedSize) return;
    setIsProcessing(true);
    try {
      await redirectToCheckout({
        name: product.name,
        price: displayPrice,
        currency: currency,
        size: selectedSize,
        image: product.image,
        quantity: 1,
      });
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('決済ページへの移動に失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-h-[92dvh] overflow-y-auto bg-white sm:max-h-[90vh] sm:max-w-4xl lg:max-w-6xl"
          onClick={(e) => e.stopPropagation()}
          style={{ borderRadius: '12px 12px 0 0' }}
        >
          {/* Mobile drag handle */}
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-1 text-neutral-400 transition-colors hover:text-black sm:right-6 sm:top-6"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
          </button>

          <div className="grid sm:grid-cols-2">
            {/* Product Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 sm:aspect-[3/4]">
              <img
                src={product.image}
                alt={product.tag}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col p-5 sm:p-8 lg:p-12">
              {/* Tabs */}
              <div className="mb-6 flex border-b border-neutral-200">
                <button
                  onClick={() => setActiveTab('product')}
                  className={`pb-3 text-xs tracking-widest transition-colors ${
                    activeTab === 'product'
                      ? 'border-b-2 border-black text-black'
                      : 'text-neutral-400'
                  }`}
                >
                  {t('PRODUCT', language)}
                </button>
                <button
                  onClick={() => setActiveTab('size')}
                  className={`ml-6 pb-3 text-xs tracking-widest transition-colors ${
                    activeTab === 'size'
                      ? 'border-b-2 border-black text-black'
                      : 'text-neutral-400'
                  }`}
                >
                  {t('SIZE_GUIDE', language)}
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'product' ? (
                  <motion.div
                    key="product"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1"
                  >
                    <h2 className="mb-1 text-xl sm:text-2xl">{product.name}</h2>
                    <p className="mb-2 text-xs tracking-[0.2em] text-neutral-400">
                      {translatedTag}
                    </p>
                    <p className="mb-6 text-2xl sm:text-3xl">
                      {symbol}{displayPrice}
                    </p>

                    {/* Size Selector */}
                    <div className="mb-8">
                      <p className="mb-3 text-xs tracking-widest text-neutral-400">
                        {t('SELECT_SIZE', language)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`border px-5 py-2.5 text-xs tracking-widest transition-colors ${
                              selectedSize === size
                                ? 'border-black bg-black text-white'
                                : 'border-neutral-300 text-neutral-600 hover:border-black'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      disabled={!selectedSize || isProcessing}
                      onClick={handleBuyNow}
                      className={`w-full py-4 text-xs tracking-widest transition-all ${
                        selectedSize && !isProcessing
                          ? 'bg-black text-white hover:bg-neutral-800'
                          : 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {isProcessing ? 'PROCESSING...' : t('BUY_NOW', language)}
                    </button>

                    {/* Description Toggle */}
                    <div className="mt-6">
                      <button
                        onClick={() => setShowDescription(!showDescription)}
                        className="flex w-full items-center justify-between border-t border-neutral-200 pt-5 text-xs tracking-widest text-neutral-600"
                      >
                        <span>{t('DETAILS', language)}</span>
                        <motion.span
                          animate={{ rotate: showDescription ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          ↓
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {showDescription && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="pt-4 text-sm leading-relaxed text-neutral-600">
                              {product.description}. Crafted with precision and designed
                              for those who appreciate the intersection of art and
                              fashion.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="size"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1"
                  >
                    <SizeChartTable printfulProductId={product.printful_product_id ?? undefined} />

                    {/* Fit Info */}
                    <div className="space-y-2 border-t border-neutral-200 pt-5">
                      <p className="text-xs leading-relaxed text-neutral-600">{t('FIT', language)}</p>
                      <p className="text-xs text-neutral-600">{t('MODEL_HEIGHT', language)}: 180cm</p>
                      <p className="text-xs text-neutral-600">{t('WEARING_SIZE', language)}: M</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
