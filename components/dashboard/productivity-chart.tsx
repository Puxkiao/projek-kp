'use client';

import { memo, useMemo } from 'react';
import { Commodity } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProductivityChartProps {
  commodities: Commodity[];
  selectedKomoditi?: string | null;
  showAnalytics?: boolean;
}

const COLORS = [
  '#059669', // emerald-600
  '#2563eb', // blue-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#dc2626', // red-600
  '#0891b2', // cyan-600
];

/**
 * ProductivityChart - Memoized for optimal performance
 * Uses React.memo and useMemo for efficient re-renders
 */
function ProductivityChartComponent({
  commodities,
  selectedKomoditi,
  showAnalytics = true,
}: ProductivityChartProps) {
  // Memoized chart data calculation
  const chartData = useMemo(() => {
    const yearlyData: Record<number, Record<string, { total: number; count: number }>> = {};

    commodities.forEach((c) => {
      if (!yearlyData[c.tahun]) {
        yearlyData[c.tahun] = {};
      }
      if (!yearlyData[c.tahun][c.komoditi]) {
        yearlyData[c.tahun][c.komoditi] = { total: 0, count: 0 };
      }
      yearlyData[c.tahun][c.komoditi].total += c.produktivitas;
      yearlyData[c.tahun][c.komoditi].count++;
    });

    return Object.entries(yearlyData)
      .map(([year, commodities]) => {
        const dataPoint: Record<string, number | string> = { tahun: year };
        Object.entries(commodities).forEach(([komoditi, data]) => {
          dataPoint[komoditi] = Math.round(data.total / data.count);
        });
        return dataPoint;
      })
      .sort((a, b) => Number(a.tahun) - Number(b.tahun));
  }, [commodities]);

  // Memoized unique commodities for legend
  const uniqueCommodities = useMemo(() => {
    if (selectedKomoditi) {
      return [selectedKomoditi];
    }
    const commodityCounts = commodities.reduce(
      (acc, c) => {
        acc[c.komoditi] = (acc[c.komoditi] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(commodityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([komoditi]) => komoditi);
  }, [commodities, selectedKomoditi]);

  // Memoized analytics calculation
  const analytics = useMemo(() => {
    if (!showAnalytics || chartData.length < 2) return null;

    const firstYear = chartData[0];
    const lastYear = chartData[chartData.length - 1];

    const results = uniqueCommodities.map((komoditi) => {
      const firstValue = Number(firstYear[komoditi]) || 0;
      const lastValue = Number(lastYear[komoditi]) || 0;
      const change = firstValue > 0
        ? parseFloat((((lastValue - firstValue) / firstValue) * 100).toFixed(1))
        : 0;
      const trend = change > 2 ? 'up' : change < -2 ? 'down' : 'stable';

      return { komoditi, firstValue, lastValue, change, trend };
    });

    return results;
  }, [chartData, uniqueCommodities, showAnalytics]);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900">
              Tren Produktivitas Tanaman (2013-2024)
            </CardTitle>
            <CardDescription className="text-slate-500">
              Rata-rata produktivitas komoditas dalam Kg/Ha per tahun
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Analytics Summary */}
        {showAnalytics && analytics && analytics.length > 0 && (
          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.slice(0, 3).map((item, index) => (
              <div
                key={item.komoditi}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-slate-700">{item.komoditi}</span>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    item.trend === 'up'
                      ? 'text-emerald-600'
                      : item.trend === 'down'
                        ? 'text-red-600'
                        : 'text-slate-500'
                  }`}
                >
                  {item.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {item.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                  {item.trend === 'stable' && <Minus className="h-3 w-3" />}
                  {item.change >= 0 ? '+' : ''}
                  {item.change}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="tahun"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#0f172a', fontWeight: 600, marginBottom: '4px' }}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString('id-ID')} Kg/Ha`,
                  name,
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />
              {uniqueCommodities.map((komoditi, index) => (
                <Line
                  key={komoditi}
                  type="monotone"
                  dataKey={komoditi}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[index % COLORS.length], r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Export memoized component for performance optimization
export const ProductivityChart = memo(ProductivityChartComponent);
