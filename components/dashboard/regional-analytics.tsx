'use client';

import { memo, useMemo } from 'react';
import { Commodity, WILAYAH_JABAR } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, MapPin, Award, Wheat } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RegionalAnalyticsProps {
  commodities: Commodity[];
  selectedTahun?: number | null;
}

const COLORS = [
  '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0',
  '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe',
  '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a',
];

/**
 * RegionalAnalytics - Memoized component for district comparison
 * Compares West Java districts (Pangalengan, Lembang, etc.) performance
 */
function RegionalAnalyticsComponent({ commodities, selectedTahun }: RegionalAnalyticsProps) {
  const targetYear = selectedTahun || 2024;
  const prevYear = targetYear - 1;

  // Memoized regional data calculation
  const regionalData = useMemo(() => {
    return WILAYAH_JABAR.map((wilayah) => {
      const currentData = commodities.filter(
        (c) => c.wilayah === wilayah && c.tahun === targetYear
      );
      const prevData = commodities.filter(
        (c) => c.wilayah === wilayah && c.tahun === prevYear
      );

      const avgProductivity = currentData.length > 0
        ? Math.round(
            currentData.reduce((sum, c) => sum + c.produktivitas, 0) / currentData.length
          )
        : 0;

      const prevAvgProductivity = prevData.length > 0
        ? Math.round(
            prevData.reduce((sum, c) => sum + c.produktivitas, 0) / prevData.length
          )
        : 0;

      const totalLand = currentData.reduce((sum, c) => sum + c.luas_lahan, 0);

      const growthRate = prevAvgProductivity > 0
        ? parseFloat(
            (((avgProductivity - prevAvgProductivity) / prevAvgProductivity) * 100).toFixed(1)
          )
        : 0;

      // Find top commodity by productivity
      const commodityProductivity = currentData.reduce(
        (acc, c) => {
          if (!acc[c.komoditi] || c.produktivitas > acc[c.komoditi]) {
            acc[c.komoditi] = c.produktivitas;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      const topCommodity = Object.entries(commodityProductivity)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '-';

      const trend = growthRate > 2 ? 'up' : growthRate < -2 ? 'down' : 'stable';

      return {
        wilayah,
        avgProductivity,
        totalLand,
        growthRate,
        topCommodity,
        trend,
      };
    }).sort((a, b) => b.avgProductivity - a.avgProductivity);
  }, [commodities, targetYear, prevYear]);

  // Top 3 performing districts
  const topDistricts = regionalData.slice(0, 3);

  // Chart data (top 10)
  const chartData = regionalData.slice(0, 10).map((d) => ({
    name: d.wilayah.length > 8 ? d.wilayah.substring(0, 8) + '...' : d.wilayah,
    fullName: d.wilayah,
    produktivitas: d.avgProductivity,
    growthRate: d.growthRate,
  }));

  return (
    <div className="space-y-6">
      {/* Top Performing Districts */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg text-slate-900">
              Top 3 Wilayah Terbaik ({targetYear})
            </CardTitle>
          </div>
          <CardDescription className="text-slate-500">
            Kabupaten dengan produktivitas rata-rata tertinggi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {topDistricts.map((district, index) => (
              <div
                key={district.wilayah}
                className={`relative overflow-hidden rounded-xl p-4 ${
                  index === 0
                    ? 'bg-gradient-to-br from-amber-50 to-amber-100 ring-1 ring-amber-200'
                    : index === 1
                      ? 'bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-slate-200'
                      : 'bg-gradient-to-br from-orange-50 to-orange-100 ring-1 ring-orange-200'
                }`}
              >
                <div className="absolute right-2 top-2 text-3xl font-bold opacity-20">
                  #{index + 1}
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      index === 0
                        ? 'bg-amber-500'
                        : index === 1
                          ? 'bg-slate-400'
                          : 'bg-orange-400'
                    }`}
                  >
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{district.wilayah}</h3>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">
                      {district.avgProductivity.toLocaleString('id-ID')}{' '}
                      <span className="text-sm font-normal text-slate-500">Kg/Ha</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Wheat className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{district.topCommodity}</span>
                      <div
                        className={`ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          district.trend === 'up'
                            ? 'bg-emerald-100 text-emerald-700'
                            : district.trend === 'down'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {district.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                        {district.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                        {district.trend === 'stable' && <Minus className="h-3 w-3" />}
                        {district.growthRate >= 0 ? '+' : ''}
                        {district.growthRate}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Comparison Chart */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-slate-900">
            Perbandingan Produktivitas Wilayah
          </CardTitle>
          <CardDescription className="text-slate-500">
            Top 10 kabupaten berdasarkan produktivitas rata-rata ({targetYear})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  width={75}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, _name: string, props: { payload: { fullName: string; growthRate: number } }) => [
                    <div key="tooltip" className="space-y-1">
                      <div className="font-semibold">{props.payload.fullName}</div>
                      <div>{value.toLocaleString('id-ID')} Kg/Ha</div>
                      <div
                        className={
                          props.payload.growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }
                      >
                        {props.payload.growthRate >= 0 ? '+' : ''}
                        {props.payload.growthRate}% dari tahun lalu
                      </div>
                    </div>,
                    '',
                  ]}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="produktivitas" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* All Districts Table */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900">
            Analisis Semua Wilayah
          </CardTitle>
          <CardDescription className="text-slate-500">
            Data lengkap produktivitas per kabupaten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-3 pr-4 font-medium text-slate-600">Wilayah</th>
                  <th className="pb-3 pr-4 text-right font-medium text-slate-600">
                    Produktivitas
                  </th>
                  <th className="pb-3 pr-4 text-right font-medium text-slate-600">
                    Luas Lahan
                  </th>
                  <th className="pb-3 pr-4 font-medium text-slate-600">Top Komoditi</th>
                  <th className="pb-3 text-right font-medium text-slate-600">Pertumbuhan</th>
                </tr>
              </thead>
              <tbody>
                {regionalData.map((district) => (
                  <tr
                    key={district.wilayah}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{district.wilayah}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-600">
                      {district.avgProductivity.toLocaleString('id-ID')} Kg/Ha
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-600">
                      {district.totalLand.toLocaleString('id-ID')} Ha
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {district.topCommodity}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          district.trend === 'up'
                            ? 'bg-emerald-100 text-emerald-700'
                            : district.trend === 'down'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {district.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                        {district.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                        {district.trend === 'stable' && <Minus className="h-3 w-3" />}
                        {district.growthRate >= 0 ? '+' : ''}
                        {district.growthRate}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export memoized component
export const RegionalAnalytics = memo(RegionalAnalyticsComponent);
