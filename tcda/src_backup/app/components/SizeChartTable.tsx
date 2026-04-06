import { useState } from 'react';
import { useSizeChart } from '../hooks/useSizeChart';

type Unit = 'cm' | 'inch';

interface SizeChartTableProps {
  category: string | undefined;
}

export function SizeChartTable({ category }: SizeChartTableProps) {
  const [unit, setUnit] = useState<Unit>('cm');
  const { data, loading } = useSizeChart(category);

  if (loading) {
    return <p className="text-xs text-neutral-400 tracking-widest">LOADING...</p>;
  }

  if (!data) {
    return <p className="text-xs text-neutral-400 tracking-widest">—</p>;
  }

  const table = unit === 'cm' ? data.chart_data.unit_cm : data.chart_data.unit_inch;
  const { measurements, sizes } = table;

  return (
    <>
      {/* Unit Toggle */}
      <div className="mb-5 flex items-center justify-end gap-2">
        {(['cm', 'inch'] as Unit[]).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`px-4 py-2 text-xs tracking-widest transition-colors ${
              unit === u ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {u.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-300">
              <th className="pb-3 pr-4 text-left text-xs tracking-widest text-neutral-400">
                SIZE
              </th>
              {measurements.map((label) => (
                <th
                  key={label}
                  className="pb-3 pr-4 text-right text-xs tracking-widest text-neutral-400 last:pr-0"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(sizes).map(([size, values]) => (
              <tr key={size} className="border-b border-neutral-200">
                <td className="py-3 pr-4 text-left tracking-widest">{size}</td>
                {values.map((v, i) => (
                  <td key={i} className="py-3 pr-4 text-right last:pr-0">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
