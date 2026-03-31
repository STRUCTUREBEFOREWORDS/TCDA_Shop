import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Product } from './ProductCard';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { redirectToCheckout } from '../utils/stripe';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

type Tab = 'product' | 'size';
type Unit = 'cm' | 'inch';

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('product');
  const [unit, setUnit] = useState<Unit>('cm');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { language, convertPrice, getCurrencySymbol, currency } = useApp();

  if (!product) return null;

  const displayPrice = convertPrice(product.price);
  const symbol = getCurrencySymbol();
  const translatedTag = t(product.tag, language);

  const convertMeasurement = (value: number): string => {
    if (unit === 'inch') {
      return (value / 2.54).toFixed(1);
    }
    return value.toString();
  };

  const handleBuyNow = async () => {
    if (!selectedSize) return;
    
    setIsProcessing(true);
    
    try {
      // Stripe Checkoutにリダイレクト
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
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-10 text-neutral-400 transition-colors hover:text-black"
            >
              <X className="h-6 w-6" strokeWidth={1} />
            </button>

            <div className="grid gap-0 md:grid-cols-2">
              {/* Product Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                <img
                  src={product.image}
                  alt={product.tag}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col p-12">
                {/* Tabs */}
                <div className="mb-8 flex border-b border-neutral-200">
                  <button
                    onClick={() => setActiveTab('product')}
                    className={`pb-4 text-xs tracking-widest transition-colors ${
                      activeTab === 'product'
                        ? 'border-b-2 border-black text-black'
                        : 'text-neutral-400'
                    }`}
                  >
                    {t('PRODUCT', language)}
                  </button>
                  <button
                    onClick={() => setActiveTab('size')}
                    className={`ml-8 pb-4 text-xs tracking-widest transition-colors ${
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1"
                    >
                      <div>
                        <h2 className="mb-2 text-2xl">{product.name}</h2>
                        <p className="mb-2 text-xs tracking-[0.2em] text-neutral-400">
                          {translatedTag}
                        </p>
                        <p className="mb-8 text-3xl">
                          {symbol}
                          {displayPrice}
                        </p>

                        {/* Size Selector */}
                        <div className="mb-12">
                          <p className="mb-4 text-xs tracking-widest text-neutral-400">
                            {t('SELECT_SIZE', language)}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {product.sizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`border px-6 py-3 text-xs tracking-widest transition-colors ${
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

                        {/* CTA Buttons */}
                        <div className="space-y-3">
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
                        </div>

                        {/* Description Toggle */}
                        <div className="mt-8">
                          <button
                            onClick={() => setShowDescription(!showDescription)}
                            className="flex w-full items-center justify-between border-t border-neutral-200 pt-6 text-xs tracking-widest text-neutral-600"
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
                                  fashion. This piece embodies timeless elegance with a
                                  contemporary edge.
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="size"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1"
                    >
                      {/* Unit Toggle */}
                      <div className="mb-6 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setUnit('cm')}
                          className={`px-4 py-2 text-xs tracking-widest transition-colors ${
                            unit === 'cm'
                              ? 'bg-black text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          CM
                        </button>
                        <button
                          onClick={() => setUnit('inch')}
                          className={`px-4 py-2 text-xs tracking-widest transition-colors ${
                            unit === 'inch'
                              ? 'bg-black text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          INCH
                        </button>
                      </div>

                      {/* Size Chart Table */}
                      <div className="mb-8 overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-neutral-300">
                              <th className="pb-3 pr-4 text-left text-xs tracking-widest text-neutral-400">
                                {t('SIZE', language)}
                              </th>
                              <th className="pb-3 pr-4 text-right text-xs tracking-widest text-neutral-400">
                                {t('CHEST', language)}
                              </th>
                              <th className="pb-3 pr-4 text-right text-xs tracking-widest text-neutral-400">
                                {t('WAIST', language)}
                              </th>
                              <th className="pb-3 text-right text-xs tracking-widest text-neutral-400">
                                {t('LENGTH', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.sizeChart.map((sizeData) => (
                              <tr
                                key={sizeData.size}
                                className="border-b border-neutral-200"
                              >
                                <td className="py-3 pr-4 text-left tracking-widest">
                                  {sizeData.size}
                                </td>
                                <td className="py-3 pr-4 text-right">
                                  {convertMeasurement(sizeData.chest)}
                                </td>
                                <td className="py-3 pr-4 text-right">
                                  {convertMeasurement(sizeData.waist)}
                                </td>
                                <td className="py-3 text-right">
                                  {convertMeasurement(sizeData.length)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Fit Info */}
                      <div className="space-y-3 border-t border-neutral-200 pt-6">
                        <p className="text-xs leading-relaxed text-neutral-600">
                          {t('FIT', language)}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {t('MODEL_HEIGHT', language)}: 180cm
                        </p>
                        <p className="text-xs text-neutral-600">
                          {t('WEARING_SIZE', language)}: M
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}