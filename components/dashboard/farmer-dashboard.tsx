'use client';

import { memo, useMemo } from 'react';
import { Commodity } from '@/lib/types';
import { useFilter } from '@/lib/context/role-context';
import { useCommodityData, formatNumber } from '@/lib/hooks/use-commodity-data';
import { StatsCards } from './stats-cards';
import { ProductivityChart } from './productivity-chart';
import { WilayahFilter } from './wilayah-filter';
import { AnalysisModule } from './analysis-module';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Wheat, Info, Zap, Activity } from 'lucide-react';

interface FarmerDashboardProps {
  commodities: Commodity[];
  isLoading: boolean;
  restrictedWilayah?: string;
}

// Trend icon component
const TrendIcon = memo(function TrendIcon({
  trend,
}: {
  trend: 'up' | 'down' | 'stable';
}) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
});

/**
 * FarmerDashboard - Optimized with useCommodityData hook
 * Read-only view with productivity trends and analysis
 * Handles 300+ records instantly with O(1) index lookups
 */
function FarmerDashboardComponent({
  commodities,
  isLoading,
  restrictedWilayah,
}: FarmerDashboardProps) {
  const { selectedTahun, selectedKomoditi } = useFilter();

  // Use optimized data hook with index-based filtering
  const {
    filteredData,
    filteredCount,
    totalRecords,
    yoyData,
    stats,
    komoditiTrends,
  } = useCommodityData(commodities, {
    wilayah: restrictedWilayah || null,
    tahun: selectedTahun,
    komoditi: selectedKomoditi,
  });

  // Get latest YoY comparison
  const latestYoY = useMemo(() => {
    if (yoyData.length < 2) return null;
    return yoyData[yoyData.length - 1];
  }, [yoyData]);

  // Top 6 komoditi trends for display
  const topKomoditiTrends = useMemo(
    () => komoditiTrends.slice(0, 6),
    [komoditiTrends]
  );

  // Memoized komoditi distribution
  const komoditiDistribution = useMemo(() => {
    const distribution = filteredData.reduce(
      (acc, c) => {
        acc[c.komoditi] = (acc[c.komoditi] || 0) + c.luas_lahan;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([komoditi, luas]) => ({ komoditi, luas }));
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <div>
          <p className="font-medium text-blue-900">Mode Monitoring Petani</p>
          <p className="mt-1 text-sm text-blue-700">
            Anda dapat memantau statistik dan tren produktivitas untuk wilayah{' '}
            <strong>{restrictedWilayah || 'Jawa Barat'}</strong>. Data diperbarui secara berkala.
          </p>
        </div>
      </div>

      {/* Performance Badge */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700">
          <Zap className="h-3 w-3" />
          {totalRecords} data terindeks
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <Activity className="h-3 w-3" />
          {filteredCount} hasil filter
        </Badge>
        {latestYoY && (
          <Badge
            variant="outline"
            className={`gap-1.5 ${
              latestYoY.trend === 'up'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : latestYoY.trend === 'down'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-slate-200'
            }`}
          >
            <TrendIcon trend={latestYoY.trend} />
            YoY {latestYoY.changePercent > 0 ? '+' : ''}{latestYoY.changePercent}%
          </Badge>
        )}
      </div>

      {/* Filters */}
      <WilayahFilter restrictedWilayah={restrictedWilayah} />

      {/* Overview Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Ringkasan Pertanian {restrictedWilayah ? `- ${restrictedWilayah}` : 'Jawa Barat'}
        </h2>
        <StatsCards
          totalLahan={stats.totalLahan}
          totalKomoditi={stats.totalKomoditi}
          rataProduktivitas={stats.avgProductivity}
          wilayahTerbesar={stats.wilayahTerbesar}
        />
      </div>

      {/* YoY Performance Card */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
            <Activity className="h-5 w-5 text-emerald-600" />
            Performa Year-over-Year
          </CardTitle>
          <CardDescription className="text-slate-500">
            Perbandingan produktivitas per tahun (2013-2024)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {yoyData.slice(-8).map((item) => (
              <div
                key={item.year}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">{item.year}</span>
                  {item.previousYear !== null && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.trend === 'up'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : item.trend === 'down'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : ''
                      }`}
                    >
                      <TrendIcon trend={item.trend} />
                      {item.changePercent > 0 ? '+' : ''}
                      {item.changePercent}%
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-lg font-bold text-emerald-600">
                  {formatNumber(item.productivity)} Kg/Ha
                </p>
                {item.previousYear !== null && (
                  <p className="text-xs text-slate-500">
                    vs {formatNumber(item.previousYear)} sebelumnya
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Trends */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Tren Produktivitas Komoditas</CardTitle>
          <CardDescription className="text-slate-500">
            Perbandingan produktivitas tahun ini dengan tahun sebelumnya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topKomoditiTrends.map((item) => (
              <div
                key={item.komoditi}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <Wheat className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.komoditi}</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatNumber(item.currentYearAvg)} Kg/Ha
                    </p>
                  </div>
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
                  <TrendIcon trend={item.trend} />
                  {item.growthPercent >= 0 ? '+' : ''}
                  {item.growthPercent}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Chart */}
      <ProductivityChart
        commodities={filteredData}
        selectedKomoditi={selectedKomoditi}
        showAnalytics
      />

      {/* Analysis Module */}
      <AnalysisModule
        commodities={commodities}
        selectedWilayah={restrictedWilayah || null}
        selectedKomoditi={selectedKomoditi}
      />

      {/* Komoditi Distribution */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Distribusi Luas Lahan per Komoditi</CardTitle>
          <CardDescription className="text-slate-500">
            Perbandingan luas lahan untuk setiap jenis komoditi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {komoditiDistribution.map((item) => {
              const maxLuas = Math.max(...komoditiDistribution.map((d) => d.luas));
              const percentage = (item.luas / maxLuas) * 100;

              return (
                <div key={item.komoditi} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.komoditi}</span>
                    <span className="text-slate-500">{formatNumber(item.luas)} Ha</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export memoized component
export const FarmerDashboard = memo(FarmerDashboardComponent);
