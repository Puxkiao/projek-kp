'use client';

import { memo, useMemo } from 'react';
import { Commodity, KOMODITI_JABAR } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, BarChart3, Percent, Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalysisModuleProps {
  commodities: Commodity[];
  selectedWilayah?: string | null;
  selectedKomoditi?: string | null;
}

/**
 * AnalysisModule - Calculates productivity growth/decline percentage
 * Provides detailed year-over-year analysis from CSV data (2013-2024)
 */
function AnalysisModuleComponent({
  commodities,
  selectedWilayah,
  selectedKomoditi,
}: AnalysisModuleProps) {
  // Filter data based on selections
  const filteredData = useMemo(() => {
    let data = commodities;
    if (selectedWilayah) data = data.filter((c) => c.wilayah === selectedWilayah);
    if (selectedKomoditi) data = data.filter((c) => c.komoditi === selectedKomoditi);
    return data;
  }, [commodities, selectedWilayah, selectedKomoditi]);

  // Calculate yearly averages and growth rates
  const yearlyAnalysis = useMemo(() => {
    const yearlyData: Record<number, number[]> = {};

    filteredData.forEach((c) => {
      if (!yearlyData[c.tahun]) yearlyData[c.tahun] = [];
      yearlyData[c.tahun].push(c.produktivitas);
    });

    const yearlyAverages = Object.entries(yearlyData)
      .map(([year, values]) => ({
        year: parseInt(year),
        productivity: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      }))
      .sort((a, b) => a.year - b.year);

    // Calculate year-over-year changes
    return yearlyAverages.map((data, index) => {
      if (index === 0) return { ...data, change: 0, changePercent: 0 };
      const prevYear = yearlyAverages[index - 1];
      const change = data.productivity - prevYear.productivity;
      const changePercent = prevYear.productivity > 0
        ? parseFloat(((change / prevYear.productivity) * 100).toFixed(1))
        : 0;
      return { ...data, change, changePercent };
    });
  }, [filteredData]);

  // Overall statistics
  const overallStats = useMemo(() => {
    if (yearlyAnalysis.length < 2) {
      return { growthRate: 0, trend: 'stable' as const, avgGrowth: 0, bestYear: null, worstYear: null };
    }

    const firstYear = yearlyAnalysis[0];
    const lastYear = yearlyAnalysis[yearlyAnalysis.length - 1];

    const growthRate = firstYear.productivity > 0
      ? parseFloat(
          (((lastYear.productivity - firstYear.productivity) / firstYear.productivity) * 100).toFixed(1)
        )
      : 0;

    const trend = growthRate > 2 ? 'up' : growthRate < -2 ? 'down' : 'stable';

    // Calculate average yearly growth
    const growthRates = yearlyAnalysis
      .slice(1)
      .map((y) => y.changePercent)
      .filter((r) => r !== 0);
    const avgGrowth = growthRates.length > 0
      ? parseFloat((growthRates.reduce((a, b) => a + b, 0) / growthRates.length).toFixed(1))
      : 0;

    // Find best and worst years
    const withChanges = yearlyAnalysis.filter((y) => y.changePercent !== 0);
    const bestYear = withChanges.length > 0
      ? withChanges.reduce((max, y) => (y.changePercent > max.changePercent ? y : max))
      : null;
    const worstYear = withChanges.length > 0
      ? withChanges.reduce((min, y) => (y.changePercent < min.changePercent ? y : min))
      : null;

    return { growthRate, trend, avgGrowth, bestYear, worstYear };
  }, [yearlyAnalysis]);

  // Per-commodity analysis
  const commodityAnalysis = useMemo(() => {
    const komoditiList = selectedKomoditi ? [selectedKomoditi] : KOMODITI_JABAR.slice(0, 6);

    return komoditiList.map((komoditi) => {
      const komoditiData = filteredData.filter((c) => c.komoditi === komoditi);

      // Get first and last year data
      const years = [...new Set(komoditiData.map((c) => c.tahun))].sort((a, b) => a - b);
      const firstYearData = komoditiData.filter((c) => c.tahun === years[0]);
      const lastYearData = komoditiData.filter((c) => c.tahun === years[years.length - 1]);

      const firstAvg = firstYearData.length > 0
        ? Math.round(firstYearData.reduce((sum, c) => sum + c.produktivitas, 0) / firstYearData.length)
        : 0;
      const lastAvg = lastYearData.length > 0
        ? Math.round(lastYearData.reduce((sum, c) => sum + c.produktivitas, 0) / lastYearData.length)
        : 0;

      const growthRate = firstAvg > 0
        ? parseFloat((((lastAvg - firstAvg) / firstAvg) * 100).toFixed(1))
        : 0;

      const trend = growthRate > 2 ? 'up' : growthRate < -2 ? 'down' : 'stable';

      return { komoditi, firstAvg, lastAvg, growthRate, trend, years };
    }).sort((a, b) => b.growthRate - a.growthRate);
  }, [filteredData, selectedKomoditi]);

  // Chart data for area chart
  const chartData = yearlyAnalysis.map((y) => ({
    tahun: y.year.toString(),
    produktivitas: y.productivity,
    pertumbuhan: y.changePercent,
  }));

  return (
    <div className="space-y-6">
      {/* Overall Growth Summary */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg text-slate-900">
              Analisis Pertumbuhan Produktivitas
            </CardTitle>
          </div>
          <CardDescription className="text-slate-500">
            Perhitungan persentase pertumbuhan/penurunan berdasarkan data 2013-2024
            {selectedWilayah && ` - ${selectedWilayah}`}
            {selectedKomoditi && ` - ${selectedKomoditi}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Overall Growth Rate */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 ring-1 ring-emerald-200">
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <Percent className="h-4 w-4" />
                Pertumbuhan Total
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    overallStats.trend === 'up'
                      ? 'text-emerald-700'
                      : overallStats.trend === 'down'
                        ? 'text-red-700'
                        : 'text-slate-700'
                  }`}
                >
                  {overallStats.growthRate >= 0 ? '+' : ''}
                  {overallStats.growthRate}%
                </span>
                {overallStats.trend === 'up' && <TrendingUp className="h-5 w-5 text-emerald-600" />}
                {overallStats.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
                {overallStats.trend === 'stable' && <Minus className="h-5 w-5 text-slate-500" />}
              </div>
              <p className="mt-1 text-xs text-emerald-600">Periode 2013-2024</p>
            </div>

            {/* Average Yearly Growth */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 ring-1 ring-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Calendar className="h-4 w-4" />
                Rata-rata per Tahun
              </div>
              <div className="mt-2">
                <span
                  className={`text-3xl font-bold ${
                    overallStats.avgGrowth >= 0 ? 'text-blue-700' : 'text-red-700'
                  }`}
                >
                  {overallStats.avgGrowth >= 0 ? '+' : ''}
                  {overallStats.avgGrowth}%
                </span>
              </div>
              <p className="mt-1 text-xs text-blue-600">Pertumbuhan tahunan</p>
            </div>

            {/* Best Year */}
            {overallStats.bestYear && (
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 ring-1 ring-amber-200">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <TrendingUp className="h-4 w-4" />
                  Tahun Terbaik
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-amber-700">
                    {overallStats.bestYear.year}
                  </span>
                </div>
                <p className="mt-1 text-xs text-amber-600">
                  +{overallStats.bestYear.changePercent}% dari tahun sebelumnya
                </p>
              </div>
            )}

            {/* Worst Year */}
            {overallStats.worstYear && (
              <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-4 ring-1 ring-red-200">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <TrendingDown className="h-4 w-4" />
                  Tahun Terendah
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-red-700">
                    {overallStats.worstYear.year}
                  </span>
                </div>
                <p className="mt-1 text-xs text-red-600">
                  {overallStats.worstYear.changePercent}% dari tahun sebelumnya
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Yearly Trend Chart */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-slate-900">Tren Tahunan Produktivitas</CardTitle>
          <CardDescription className="text-slate-500">
            Visualisasi perubahan produktivitas dari tahun ke tahun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="tahun"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 11 }}
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
                  formatter={(value: number, name: string) => {
                    if (name === 'produktivitas') {
                      return [`${value.toLocaleString('id-ID')} Kg/Ha`, 'Produktivitas'];
                    }
                    return [`${value >= 0 ? '+' : ''}${value}%`, 'Pertumbuhan'];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="produktivitas"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProductivity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-Commodity Analysis */}
      {!selectedKomoditi && (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900">Analisis per Komoditi</CardTitle>
            <CardDescription className="text-slate-500">
              Perbandingan pertumbuhan produktivitas antar komoditi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {commodityAnalysis.map((item) => (
                <div
                  key={item.komoditi}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.komoditi}</p>
                    <p className="text-sm text-slate-500">
                      {item.firstAvg.toLocaleString('id-ID')} → {item.lastAvg.toLocaleString('id-ID')} Kg/Ha
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${
                      item.trend === 'up'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.trend === 'down'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {item.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    {item.trend === 'stable' && <Minus className="h-3 w-3" />}
                    {item.growthRate >= 0 ? '+' : ''}
                    {item.growthRate}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year-over-Year Details */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900">Detail Pertumbuhan Tahunan</CardTitle>
          <CardDescription className="text-slate-500">
            Persentase perubahan produktivitas per tahun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-2 pr-4 font-medium text-slate-600">Tahun</th>
                  <th className="pb-2 pr-4 text-right font-medium text-slate-600">
                    Produktivitas
                  </th>
                  <th className="pb-2 pr-4 text-right font-medium text-slate-600">
                    Perubahan
                  </th>
                  <th className="pb-2 text-right font-medium text-slate-600">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {yearlyAnalysis.map((year) => (
                  <tr key={year.year} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 font-medium text-slate-900">{year.year}</td>
                    <td className="py-2 pr-4 text-right text-slate-700">
                      {year.productivity.toLocaleString('id-ID')} Kg/Ha
                    </td>
                    <td
                      className={`py-2 pr-4 text-right ${
                        year.change > 0
                          ? 'text-emerald-600'
                          : year.change < 0
                            ? 'text-red-600'
                            : 'text-slate-500'
                      }`}
                    >
                      {year.change !== 0 && (year.change > 0 ? '+' : '')}
                      {year.change !== 0 ? `${year.change.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-2 text-right">
                      {year.changePercent !== 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            year.changePercent > 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {year.changePercent > 0 && <TrendingUp className="h-3 w-3" />}
                          {year.changePercent < 0 && <TrendingDown className="h-3 w-3" />}
                          {year.changePercent > 0 ? '+' : ''}
                          {year.changePercent}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
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
export const AnalysisModule = memo(AnalysisModuleComponent);
