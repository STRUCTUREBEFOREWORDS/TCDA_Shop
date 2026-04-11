import { useState, useEffect } from 'react';

const API_BASE = 'https://api.tcdashop.com';

export type SizeTableEntry = {
  type: string;
  unit: string;
  description: string;
  image_url: string;
  image_description: string;
  measurements: {
    type_label: string;
    values: { size: string; value: string }[];
  }[];
};

export type SizeChartData = {
  catalog_product_id: number;
  available_sizes: string[];
  size_tables: SizeTableEntry[];
};

export function useSizeChart(printfulProductId: number | undefined) {
  const [data, setData] = useState<SizeChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!printfulProductId) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/size-charts/by-product/${printfulProductId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [printfulProductId]);

  return { data, loading };
}
