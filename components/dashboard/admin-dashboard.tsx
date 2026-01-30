'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import { Commodity, CommodityFormData } from '@/lib/types';
import { useFilter } from '@/lib/context/role-context';
import { useCommodityData, formatNumber } from '@/lib/hooks/use-commodity-data';
import { StatsCards } from './stats-cards';
import { CommodityForm } from './commodity-form';
import { CommodityTable } from './commodity-table';
import { ProductivityChart } from './productivity-chart';
import { WilayahFilter } from './wilayah-filter';
import { RegionalAnalytics } from './regional-analytics';
import { AnalysisModule } from './analysis-module';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  BarChart3,
  MapPin,
  Database,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Zap,
} from 'lucide-react';

interface AdminDashboardProps {
  commodities: Commodity[];
  isLoading: boolean;
  onCreateCommodity: (data: CommodityFormData) => Promise<void>;
  onUpdateCommodity: (id: string, data: Partial<Commodity>) => Promise<void>;
  onDeleteCommodity: (id: string) => Promise<void>;
}

// Trend icon component
const TrendIcon = memo(function TrendIcon({
  trend,
  size = 'sm',
}: {
  trend: 'up' | 'down' | 'stable';
  size?: 'sm' | 'md';
}) {
  const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  
  if (trend === 'up') return <TrendingUp className={`${iconClass} text-emerald-600`} />;
  if (trend === 'down') return <TrendingDown className={`${iconClass} text-red-500`} />;
  return <Minus className={`${iconClass} text-slate-400`} />;
});

/**
 * AdminDashboard - Optimized with useCommodityData hook
 * Handles 300+ records instantly with O(1) index lookups
 */
function AdminDashboardComponent({
  commodities,
  isLoading,
  onCreateCommodity,
  onUpdateCommodity,
  onDeleteCommodity,
}: AdminDashboardProps) {
  const { selectedWilayah, selectedTahun, selectedKomoditi } = useFilter();
  const [activeTab, setActiveTab] = useState('overview');

  // Use optimized data hook with index-based filtering
  const {
    filteredData,
    filteredCount,
    totalRecords,
    yoyData,
    stats,
    wilayahPerformance,
    komoditiTrends,
  } = useCommodityData(commodities, {
    wilayah: selectedWilayah,
    tahun: selectedTahun,
    komoditi: selectedKomoditi,
  });

  // Limit table data for DOM performance
  const tableData = useMemo(
    () => filteredData.slice(0, 50),
    [filteredData]
  );

  // Get latest YoY comparison
  const latestYoY = useMemo(() => {
    if (yoyData.length < 2) return null;
    return yoyData[yoyData.length - 1];
  }, [yoyData]);

  // Top 3 performing wilayah
  const topWilayah = useMemo(
    () => wilayahPerformance.slice(0, 3),
    [wilayahPerformance]
  );

  // Top 3 komoditi trends
  const topKomoditi = useMemo(
    () => komoditiTrends.slice(0, 3),
    [komoditiTrends]
  );

  return (
    <div className="space-y-6">
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
      <WilayahFilter />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Ringkasan</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analisis YoY</span>
          </TabsTrigger>
          <TabsTrigger value="regional" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Regional</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <StatsCards
            totalLahan={stats.totalLahan}
            totalKomoditi={stats.totalKomoditi}
            rataProduktivitas={stats.avgProductivity}
            wilayahTerbesar={stats.wilayahTerbesar}
          />

          {/* Quick Insights Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* YoY Performance Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  Performa YoY
                </CardTitle>
                <CardDescription>Perbandingan produktivitas tahun ke tahun</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {yoyData.slice(-4).map((item) => (
                    <div key={item.year} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{item.year}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatNumber(item.productivity)} Kg/Ha
                        </span>
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Wilayah Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Top Wilayah
                </CardTitle>
                <CardDescription>Wilayah dengan produktivitas tertinggi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topWilayah.map((item, idx) => (
                    <div key={item.wilayah} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                            idx === 0
                              ? 'bg-amber-500'
                              : idx === 1
                              ? 'bg-slate-400'
                              : 'bg-amber-700'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm">{item.wilayah}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatNumber(item.avgProductivity)}
                        </span>
                        <TrendIcon trend={item.growthRate > 2 ? 'up' : item.growthRate < -2 ? 'down' : 'stable'} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Komoditi Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  Tren Komoditi
                </CardTitle>
                <CardDescription>Komoditi dengan performa terbaik</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topKomoditi.map((item) => (
                    <div key={item.komoditi} className="flex items-center justify-between">
                      <span className="text-sm">{item.komoditi}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatNumber(item.currentYearAvg)}
                        </span>
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
                          {item.growthPercent > 0 ? '+' : ''}
                          {item.growthPercent}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <ProductivityChart
            commodities={filteredData}
            selectedKomoditi={selectedKomoditi}
            showAnalytics
          />
        </TabsContent>

        {/* Analysis Tab - YoY Focus */}
        <TabsContent value="analysis" className="mt-6">
          <AnalysisModule
            commodities={commodities}
            selectedWilayah={selectedWilayah}
            selectedKomoditi={selectedKomoditi}
          />
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional" className="mt-6">
          <RegionalAnalytics commodities={commodities} selectedTahun={selectedTahun} />
        </TabsContent>

        {/* Data Management Tab */}
        <TabsContent value="data" className="mt-6 space-y-6">
          <CommodityForm onSubmit={onCreateCommodity} />
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Manajemen Data Komoditas</h2>
              <p className="text-sm text-slate-500">
                Menampilkan {tableData.length} dari {filteredCount} data
              </p>
            </div>
            <CommodityTable
              commodities={tableData}
              onEdit={onUpdateCommodity}
              onDelete={onDeleteCommodity}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export memoized component
export const AdminDashboard = memo(AdminDashboardComponent);
