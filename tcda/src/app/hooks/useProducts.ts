'use client';

import { useEffect, useState } from 'react';
import { Product } from '../components/ProductCard';

interface ApiProduct {
  id: string;
  name: string;
  price: number;
  printful_product_id: number;
  thumbnail_url: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://api.tcdashop.com/products')
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then((data: { products: ApiProduct[] }) => {
        setProducts(
          data.products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.thumbnail_url,
            tag: '',
            description: '',
            sizes: [],
            sizeChart: [],
          }))
        );
      })
      .catch(() => setError('商品を読み込めませんでした'))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}
