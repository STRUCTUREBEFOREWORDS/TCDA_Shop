import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useGlobalContext } from "./Root";
import { formatPrice } from "../utils/formatPrice";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface Variant {
  id: number;
  size: string;
  color: string;
  retail_price: string;
  availability_status: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail_url: string;
  sizes: string[];
  stock: number;
  variants: Variant[];
}

const SIZE_TABLE: { size: string; chest: string; length: string }[] = [
  { size: "XS", chest: "86-91", length: "66" },
  { size: "S",  chest: "91-97", length: "69" },
  { size: "M",  chest: "97-102", length: "71" },
  { size: "L",  chest: "107-112", length: "74" },
  { size: "XL", chest: "117-122", length: "76" },
  { size: "2XL", chest: "127-132", length: "79" },
];

const FAQ = [
  {
    q: "How long does shipping take?",
    a: "Orders are fulfilled within 2–5 business days, then shipped. Total delivery is typically 5–10 business days.",
  },
  {
    q: "Can I return or exchange?",
    a: "We accept returns within 14 days for defective items. Size exchanges are available once per order.",
  },
  {
    q: "What if I'm between sizes?",
    a: "We recommend sizing up for a relaxed fit. The model wears size M at 180 cm.",
  },
];

export function ProductPage() {
  const { id } = useParams();
  const { currency, rates, addToCart } = useGlobalContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoading(true);
    fetch(`https://api.tcdashop.com/products/${id}`)
      .then((res) => res.json())
      .then((data: Product) => {
        setProduct(data);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black text-sm font-light tracking-widest opacity-40">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black text-sm font-light tracking-widest opacity-40">Product not found.</p>
      </div>
    );
  }

  const convertedPrice = Math.round(product.price * rates[currency]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({
      artworkId: product.id,
      artworkName: product.name,
      price: convertedPrice,
      price_jpy: product.price,
      currency,
      size: selectedSize,
      imageUrl: product.thumbnail_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* BACK */}
      <div className="px-8 md:px-20 py-6 max-w-7xl mx-auto">
        <Link
          to="/products"
          className="text-black text-xs font-light tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity duration-300"
        >
          ← BACK
        </Link>
      </div>

      {/* MAIN: image + info */}
      <section className="px-8 md:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="aspect-[3/4] overflow-hidden bg-black/5"
          >
            <ImageWithFallback
              src={product.thumbnail_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-8 pt-4"
          >
            {/* Name */}
            <h1 className="text-black text-2xl font-light tracking-widest uppercase">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-black text-xl font-light">
              {formatPrice(convertedPrice, currency)}
            </p>

            {/* Stock */}
            {product.stock <= 5 ? (
              <p className="text-red-500 text-xs font-light tracking-widest">
                残り{product.stock}点
              </p>
            ) : (
              <p className="text-black text-xs font-light opacity-40 tracking-widest">
                残り{product.stock}点
              </p>
            )}

            {/* Size selection */}
            <div>
              <p className="text-black text-xs font-light tracking-[0.3em] uppercase opacity-40 mb-4">
                Size
              </p>
              <div className="flex flex-wrap gap-3">
                {(product.sizes ?? ["XS", "S", "M", "L", "XL", "2XL"]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 flex items-center justify-center text-xs font-light tracking-widest uppercase transition-all duration-300 ${
                      selectedSize === size
                        ? "bg-black text-white"
                        : "bg-white text-black border border-black/20 hover:border-black/60"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="w-full py-4 bg-black text-white text-xs font-light tracking-[0.3em] uppercase hover:bg-black/80 transition-colors duration-300 disabled:opacity-30"
            >
              {added ? "ADDED" : "ADD TO CART"}
            </button>

            {/* Delivery */}
            <div className="border-t border-black/10 pt-6">
              <p className="text-black text-xs font-light tracking-widest uppercase opacity-40 mb-2">
                Delivery
              </p>
              <p className="text-black text-xs font-light opacity-60 leading-relaxed">
                通常5〜10営業日でお届け
              </p>
            </div>

            {/* Model info */}
            <div className="border-t border-black/10 pt-6">
              <p className="text-black text-xs font-light tracking-widest uppercase opacity-40 mb-2">
                Model
              </p>
              <p className="text-black text-xs font-light opacity-60 leading-relaxed">
                モデル身長180cm / Mサイズ着用
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DETAILS SECTION */}
      <section className="px-8 md:px-20 max-w-7xl mx-auto mt-24 space-y-16 pb-32">
        {/* Material */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-black/10 pt-8"
        >
          <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-4">
            Material &amp; Details
          </h2>
          <p className="text-black text-sm font-light opacity-60 leading-relaxed">
            100% polyester, sublimation print. Machine wash cold. Do not tumble dry.
            All-over dye sublimation process produces vibrant, fade-resistant graphics
            that are part of the fabric itself.
          </p>
        </motion.div>

        {/* Size table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-black/10 pt-8"
        >
          <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-6">
            Size Guide (cm)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-light">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left py-2 pr-8 text-black opacity-40 font-light tracking-widest uppercase">
                    Size
                  </th>
                  <th className="text-left py-2 pr-8 text-black opacity-40 font-light tracking-widest uppercase">
                    Chest (cm)
                  </th>
                  <th className="text-left py-2 text-black opacity-40 font-light tracking-widest uppercase">
                    Length (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.map((row) => (
                  <tr key={row.size} className="border-b border-black/5">
                    <td className="py-3 pr-8 text-black opacity-70">{row.size}</td>
                    <td className="py-3 pr-8 text-black opacity-70">{row.chest}</td>
                    <td className="py-3 text-black opacity-70">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Shipping & Returns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-black/10 pt-8"
        >
          <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-4">
            Shipping &amp; Returns
          </h2>
          <p className="text-black text-sm font-light opacity-60 leading-relaxed">
            Orders are processed within 2–5 business days via Printful. Delivery typically
            takes 5–10 business days depending on region. Returns are accepted within 14 days
            for defective or incorrect items. Customers are responsible for return shipping costs
            unless the item is defective.
          </p>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-black/10 pt-8"
        >
          <h2 className="text-black text-xs font-light tracking-[0.3em] uppercase mb-6">
            FAQ
          </h2>
          <div className="space-y-0">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-black/10">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-4 flex justify-between items-center"
                >
                  <span className="text-black text-sm font-light opacity-80">{item.q}</span>
                  <span className="text-black text-xs font-light opacity-40 ml-4">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-black text-xs font-light opacity-60 leading-relaxed pb-4"
                  >
                    {item.a}
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
