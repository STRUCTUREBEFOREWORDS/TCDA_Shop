import { useState, useEffect } from 'react';

const API_BASE = 'https://api.tcdashop.com';

export type SizeChartData = {
  category: string;
  product_id: number;
  chart_data: {
    unit_cm: {
      measurements: string[];
      sizes: Record<string, number[]>;
    };
    unit_inch: {
      measurements: string[];
      sizes: Record<string, number[]>;
    };
  };
};

export function useSizeChart(category: string | undefined) {
  const [data, setData] = useState<SizeChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/size-charts/${category}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  return { data, loading };
}
