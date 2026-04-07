import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { useGlobalContext } from "./Root";

interface Product {
  id: string;
  name: string;
  price: number;
  printful_product_id: number;
  thumbnail_url: string;
}

export function ProductPage() {
  const { id } = useParams();
  const { currency, rates } = useGlobalContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.tcdashop.com/products")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.products ?? []).find((p: Product) => p.id === id);
        setProduct(found ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const symbols: Record<string, string> = {
    JPY: "\u00A5", USD: "$", EUR: "\u20AC", GBP: "\u00A3", KRW: "\u20A9", CNY: "CN\u00A5",
  };

  const formatPrice = (jpy: number) => {
    const rate = rates[currency] ?? 1;
    const amount = Math.round(jpy * rate);
    return `${symbols[currency] ?? "\u00A5"}${amount.toLocaleString()}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-black/40 text-xs tracking-widest">Loading...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-black/40 text-xs tracking-widest">商品が見つかりません</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-14">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">
        <Link to="/products" className="text-black/40 text-xs tracking-widest uppercase hover:text-black transition-colors">
          Back
        </Link>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square overflow-hidden bg-black/5">
            <img
              src={product.thumbnail_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-black text-sm font-light tracking-[0.3em] uppercase">
              {product.name}
            </h1>
            <p className="text-black text-2xl font-extralight tracking-wider">
              {formatPrice(product.price)}
            </p>
            <button className="w-full border border-black text-black text-xs font-light tracking-[0.3em] uppercase py-4 hover:bg-black hover:text-white transition-colors duration-300">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
