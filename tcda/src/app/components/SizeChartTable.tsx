import { useState } from 'react';
import { useSizeChart } from '../hooks/useSizeChart';

function toFraction(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  const whole = Math.floor(num);
  const decimal = Math.round((num - whole) * 8) / 8;
  const fractionMap: Record<number, string> = {
    0: '', 0.125: '⅛', 0.25: '¼', 0.375: '⅜',
    0.5: '½', 0.625: '⅝', 0.75: '¾', 0.875: '⅞',
  };
  const frac = fractionMap[decimal] ?? '';
  return whole === 0 ? (frac || '0') : frac ? `${whole}${frac}` : `${whole}`;
}

type Unit = 'cm' | 'inch';

interface SizeChartTableProps {
  printfulProductId: number | undefined;
}

export function SizeChartTable({ printfulProductId }: SizeChartTableProps) {
  const [unit, setUnit] = useState<Unit>('cm');
  const { data, loading } = useSizeChart(printfulProductId);

  if (loading) {
    return <p className="text-xs text-neutral-400 tracking-widest">LOADING...</p>;
  }

  if (!data || !data.size_tables?.length) {
    return <p className="text-xs text-neutral-400 tracking-widest">—</p>;
  }

  // Find the table matching the selected unit
  const targetUnit = unit === 'cm' ? 'cm' : 'inches';
  const table = data.size_tables.find((t) => t.unit === targetUnit)
    ?? data.size_tables.find((t) => t.type === 'product_measure')
    ?? data.size_tables[0];

  const sizes = data.available_sizes;
  const measurements = table.measurements;

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
              {measurements.map((m) => (
                <th
                  key={m.type_label}
                  className="pb-3 pr-4 text-right text-xs tracking-widest text-neutral-400 last:pr-0"
                >
                  {m.type_label.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size} className="border-b border-neutral-200">
                <td className="py-3 pr-4 text-left tracking-widest">{size}</td>
                {measurements.map((m) => {
                  const entry = m.values.find((v) => v.size === size);
                  const val = entry?.value ?? '—';
                  return (
                    <td key={m.type_label} className="py-3 pr-4 text-right last:pr-0">
                      {unit === 'inch' ? toFraction(val) : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
