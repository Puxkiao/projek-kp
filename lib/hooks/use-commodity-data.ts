'use client';

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { Commodity, WILAYAH_JABAR, KOMODITI_JABAR } from '@/lib/types';

// ============================================
// Types for optimized data processing
// ============================================

export interface FilterOptions {
  wilayah: string | null;
  tahun: number | null;
  komoditi: string | null;
}

export interface YoYData {
  year: number;
  productivity: number;
  previousYear: number | null;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CommodityStats {
  totalRecords: number;
  totalLahan: number;
  totalKomoditi: number;
  avgProductivity: number;
  maxProductivity: number;
  minProductivity: number;
  wilayahTerbesar: string;
  komoditiTertinggi: string;
}

export interface WilayahPerformance {
  wilayah: string;
  avgProductivity: number;
  totalLahan: number;
  recordCount: number;
  growthRate: number;
  rank: number;
}

export interface KomoditiTrend {
  komoditi: string;
  currentYearAvg: number;
  previousYearAvg: number;
  growthPercent: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================
// Optimized Index Maps for O(1) Lookups
// ============================================

interface IndexedData {
  byWilayah: Map<string, Commodity[]>;
  byTahun: Map<number, Commodity[]>;
  byKomoditi: Map<string, Commodity[]>;
  byWilayahTahun: Map<string, Commodity[]>;
  byKomoditiTahun: Map<string, Commodity[]>;
  allYears: number[];
  allWilayah: string[];
  allKomoditi: string[];
}

/**
 * Pre-build index maps for O(1) filtering
 * Called once when data changes
 */
function buildIndexes(commodities: Commodity[]): IndexedData {
  const byWilayah = new Map<string, Commodity[]>();
  const byTahun = new Map<number, Commodity[]>();
  const byKomoditi = new Map<string, Commodity[]>();
  const byWilayahTahun = new Map<string, Commodity[]>();
  const byKomoditiTahun = new Map<string, Commodity[]>();
  const yearsSet = new Set<number>();
  const wilayahSet = new Set<string>();
  const komoditiSet = new Set<string>();

  for (const c of commodities) {
    // Index by wilayah
    if (!byWilayah.has(c.wilayah)) byWilayah.set(c.wilayah, []);
    byWilayah.get(c.wilayah)!.push(c);

    // Index by tahun
    if (!byTahun.has(c.tahun)) byTahun.set(c.tahun, []);
    byTahun.get(c.tahun)!.push(c);

    // Index by komoditi
    if (!byKomoditi.has(c.komoditi)) byKomoditi.set(c.komoditi, []);
    byKomoditi.get(c.komoditi)!.push(c);

    // Composite index: wilayah + tahun
    const wtKey = `${c.wilayah}_${c.tahun}`;
    if (!byWilayahTahun.has(wtKey)) byWilayahTahun.set(wtKey, []);
    byWilayahTahun.get(wtKey)!.push(c);

    // Composite index: komoditi + tahun
    const ktKey = `${c.komoditi}_${c.tahun}`;
    if (!byKomoditiTahun.has(ktKey)) byKomoditiTahun.set(ktKey, []);
    byKomoditiTahun.get(ktKey)!.push(c);

    yearsSet.add(c.tahun);
    wilayahSet.add(c.wilayah);
    komoditiSet.add(c.komoditi);
  }

  return {
    byWilayah,
    byTahun,
    byKomoditi,
    byWilayahTahun,
    byKomoditiTahun,
    allYears: Array.from(yearsSet).sort((a, b) => a - b),
    allWilayah: Array.from(wilayahSet).sort(),
    allKomoditi: Array.from(komoditiSet).sort(),
  };
}

// ============================================
// Main Hook: useCommodityData
// ============================================

/**
 * High-performance data fetching hook with optimized filtering
 * Handles 300+ records instantly without blocking main thread
 */
export function useCommodityData(
  commodities: Commodity[],
  filters: FilterOptions
) {
  // Build indexes once when data changes - O(n) single pass
  const indexes = useMemo(() => buildIndexes(commodities), [commodities]);

  // ============================================
  // Optimized Filtering with Index Lookups
  // ============================================

  const filteredData = useMemo(() => {
    const { wilayah, tahun, komoditi } = filters;

    // No filters - return all
    if (!wilayah && !tahun && !komoditi) {
      return commodities;
    }

    // Single filter - use direct index lookup O(1)
    if (wilayah && !tahun && !komoditi) {
      return indexes.byWilayah.get(wilayah) || [];
    }
    if (!wilayah && tahun && !komoditi) {
      return indexes.byTahun.get(tahun) || [];
    }
    if (!wilayah && !tahun && komoditi) {
      return indexes.byKomoditi.get(komoditi) || [];
    }

    // Two filters - use composite index + filter
    if (wilayah && tahun && !komoditi) {
      return indexes.byWilayahTahun.get(`${wilayah}_${tahun}`) || [];
    }
    if (!wilayah && tahun && komoditi) {
      return indexes.byKomoditiTahun.get(`${komoditi}_${tahun}`) || [];
    }

    // Wilayah + Komoditi: start from smaller set
    if (wilayah && !tahun && komoditi) {
      const wilayahData = indexes.byWilayah.get(wilayah) || [];
      return wilayahData.filter((c) => c.komoditi === komoditi);
    }

    // All three filters: use composite index + filter
    if (wilayah && tahun && komoditi) {
      const wtData = indexes.byWilayahTahun.get(`${wilayah}_${tahun}`) || [];
      return wtData.filter((c) => c.komoditi === komoditi);
    }

    return commodities;
  }, [commodities, filters, indexes]);

  // ============================================
  // Year-over-Year Productivity Calculation
  // ============================================

  const yoyData = useMemo((): YoYData[] => {
    const { allYears } = indexes;
    if (allYears.length === 0) return [];

    // Group filtered data by year
    const yearlyProductivity = new Map<number, number[]>();
    
    for (const c of filteredData) {
      if (!yearlyProductivity.has(c.tahun)) {
        yearlyProductivity.set(c.tahun, []);
      }
      yearlyProductivity.get(c.tahun)!.push(c.produktivitas);
    }

    // Calculate averages and YoY changes
    const result: YoYData[] = [];
    let previousAvg: number | null = null;

    for (const year of allYears) {
      const values = yearlyProductivity.get(year);
      if (!values || values.length === 0) continue;

      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      
      let change = 0;
      let changePercent = 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (previousAvg !== null) {
        change = avg - previousAvg;
        changePercent = previousAvg > 0 
          ? Number(((change / previousAvg) * 100).toFixed(2))
          : 0;
        trend = changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable';
      }

      result.push({
        year,
        productivity: avg,
        previousYear: previousAvg,
        change,
        changePercent,
        trend,
      });

      previousAvg = avg;
    }

    return result;
  }, [filteredData, indexes]);

  // ============================================
  // Statistics Calculation
  // ============================================

  const stats = useMemo((): CommodityStats => {
    if (filteredData.length === 0) {
      return {
        totalRecords: 0,
        totalLahan: 0,
        totalKomoditi: 0,
        avgProductivity: 0,
        maxProductivity: 0,
        minProductivity: 0,
        wilayahTerbesar: '-',
        komoditiTertinggi: '-',
      };
    }

    let totalLahan = 0;
    let totalProductivity = 0;
    let maxProductivity = -Infinity;
    let minProductivity = Infinity;
    const wilayahLand = new Map<string, number>();
    const komoditiProd = new Map<string, number[]>();
    const komoditiSet = new Set<string>();

    // Single pass aggregation
    for (const c of filteredData) {
      totalLahan += c.luas_lahan;
      totalProductivity += c.produktivitas;
      
      if (c.produktivitas > maxProductivity) maxProductivity = c.produktivitas;
      if (c.produktivitas < minProductivity) minProductivity = c.produktivitas;

      wilayahLand.set(c.wilayah, (wilayahLand.get(c.wilayah) || 0) + c.luas_lahan);
      
      if (!komoditiProd.has(c.komoditi)) komoditiProd.set(c.komoditi, []);
      komoditiProd.get(c.komoditi)!.push(c.produktivitas);
      
      komoditiSet.add(c.komoditi);
    }

    // Find wilayah with most land
    let wilayahTerbesar = '-';
    let maxLand = 0;
    for (const [w, land] of wilayahLand) {
      if (land > maxLand) {
        maxLand = land;
        wilayahTerbesar = w;
      }
    }

    // Find komoditi with highest avg productivity
    let komoditiTertinggi = '-';
    let maxAvgProd = 0;
    for (const [k, prods] of komoditiProd) {
      const avg = prods.reduce((a, b) => a + b, 0) / prods.length;
      if (avg > maxAvgProd) {
        maxAvgProd = avg;
        komoditiTertinggi = k;
      }
    }

    return {
      totalRecords: filteredData.length,
      totalLahan,
      totalKomoditi: komoditiSet.size,
      avgProductivity: Math.round(totalProductivity / filteredData.length),
      maxProductivity: maxProductivity === -Infinity ? 0 : maxProductivity,
      minProductivity: minProductivity === Infinity ? 0 : minProductivity,
      wilayahTerbesar,
      komoditiTertinggi,
    };
  }, [filteredData]);

  // ============================================
  // Wilayah Performance Ranking
  // ============================================

  const wilayahPerformance = useMemo((): WilayahPerformance[] => {
    const { allYears } = indexes;
    const latestYear = allYears[allYears.length - 1];
    const prevYear = allYears[allYears.length - 2];

    const performance: WilayahPerformance[] = [];

    for (const wilayah of WILAYAH_JABAR) {
      const currentData = indexes.byWilayahTahun.get(`${wilayah}_${latestYear}`) || [];
      const prevData = indexes.byWilayahTahun.get(`${wilayah}_${prevYear}`) || [];

      if (currentData.length === 0) continue;

      const avgProductivity = Math.round(
        currentData.reduce((sum, c) => sum + c.produktivitas, 0) / currentData.length
      );
      const totalLahan = currentData.reduce((sum, c) => sum + c.luas_lahan, 0);

      const prevAvg = prevData.length > 0
        ? prevData.reduce((sum, c) => sum + c.produktivitas, 0) / prevData.length
        : avgProductivity;

      const growthRate = prevAvg > 0
        ? Number((((avgProductivity - prevAvg) / prevAvg) * 100).toFixed(1))
        : 0;

      performance.push({
        wilayah,
        avgProductivity,
        totalLahan,
        recordCount: currentData.length,
        growthRate,
        rank: 0,
      });
    }

    // Sort by productivity and assign ranks
    performance.sort((a, b) => b.avgProductivity - a.avgProductivity);
    performance.forEach((p, i) => (p.rank = i + 1));

    return performance;
  }, [indexes]);

  // ============================================
  // Komoditi Trend Analysis
  // ============================================

  const komoditiTrends = useMemo((): KomoditiTrend[] => {
    const { allYears } = indexes;
    const latestYear = allYears[allYears.length - 1];
    const prevYear = allYears[allYears.length - 2];

    const trends: KomoditiTrend[] = [];

    for (const komoditi of KOMODITI_JABAR) {
      const currentData = indexes.byKomoditiTahun.get(`${komoditi}_${latestYear}`) || [];
      const prevData = indexes.byKomoditiTahun.get(`${komoditi}_${prevYear}`) || [];

      if (currentData.length === 0) continue;

      const currentYearAvg = Math.round(
        currentData.reduce((sum, c) => sum + c.produktivitas, 0) / currentData.length
      );
      const previousYearAvg = prevData.length > 0
        ? Math.round(prevData.reduce((sum, c) => sum + c.produktivitas, 0) / prevData.length)
        : currentYearAvg;

      const growthPercent = previousYearAvg > 0
        ? Number((((currentYearAvg - previousYearAvg) / previousYearAvg) * 100).toFixed(1))
        : 0;

      const trend: 'up' | 'down' | 'stable' = 
        growthPercent > 2 ? 'up' : growthPercent < -2 ? 'down' : 'stable';

      trends.push({
        komoditi,
        currentYearAvg,
        previousYearAvg,
        growthPercent,
        trend,
      });
    }

    return trends.sort((a, b) => b.currentYearAvg - a.currentYearAvg);
  }, [indexes]);

  // ============================================
  // Available filter options
  // ============================================

  const filterOptions = useMemo(() => ({
    years: indexes.allYears,
    wilayah: indexes.allWilayah,
    komoditi: indexes.allKomoditi,
  }), [indexes]);

  return {
    // Filtered data
    filteredData,
    totalRecords: commodities.length,
    filteredCount: filteredData.length,
    
    // Analytics
    yoyData,
    stats,
    wilayahPerformance,
    komoditiTrends,
    
    // Filter options
    filterOptions,
    
    // Quick lookups
    getByWilayah: useCallback(
      (w: string) => indexes.byWilayah.get(w) || [],
      [indexes]
    ),
    getByTahun: useCallback(
      (t: number) => indexes.byTahun.get(t) || [],
      [indexes]
    ),
    getByKomoditi: useCallback(
      (k: string) => indexes.byKomoditi.get(k) || [],
      [indexes]
    ),
  };
}

// ============================================
// Utility: Calculate growth rate between years
// ============================================

export function calculateGrowthRate(
  current: number,
  previous: number
): { rate: number; trend: 'up' | 'down' | 'stable' } {
  if (previous === 0) return { rate: 0, trend: 'stable' };
  
  const rate = Number((((current - previous) / previous) * 100).toFixed(1));
  const trend = rate > 2 ? 'up' : rate < -2 ? 'down' : 'stable';
  
  return { rate, trend };
}

// ============================================
// Utility: Format large numbers
// ============================================

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}jt`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}rb`;
  }
  return num.toLocaleString('id-ID');
}
