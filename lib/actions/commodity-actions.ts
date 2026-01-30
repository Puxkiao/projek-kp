'use server';

import { Commodity, CommodityFormData, WILAYAH_JABAR, KOMODITI_JABAR } from '@/lib/types';

// Generate mock data for 2013-2024 based on CSV structure
function generateMockData(): Commodity[] {
  const data: Commodity[] = [];
  let id = 1;

  // Base productivity values for each commodity (Kg/Ha)
  const baseProductivity: Record<string, number> = {
    'Padi': 5500,
    'Jagung': 6200,
    'Kedelai': 1400,
    'Kacang Tanah': 1800,
    'Ubi Kayu': 22000,
    'Ubi Jalar': 18000,
    'Sayuran': 12000,
    'Buah-buahan': 15000,
    'Kopi': 850,
    'Teh': 1200,
    'Kelapa': 1100,
    'Cengkeh': 350,
  };

  // Base land size for each region (Ha)
  const baseLandSize: Record<string, number> = {
    'Garut': 85000,
    'Bandung': 72000,
    'Sukabumi': 95000,
    'Cianjur': 78000,
    'Tasikmalaya': 68000,
    'Ciamis': 55000,
    'Kuningan': 45000,
    'Majalengka': 52000,
    'Sumedang': 48000,
    'Subang': 82000,
    'Purwakarta': 35000,
    'Karawang': 92000,
    'Bekasi': 28000,
    'Bogor': 65000,
    'Cirebon': 42000,
  };

  // Seed random for consistent data
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  let seedCounter = 1;

  // Generate data for years 2013-2024
  for (let tahun = 2013; tahun <= 2024; tahun++) {
    for (const wilayah of WILAYAH_JABAR) {
      // Select commodities based on region characteristics
      const selectedKomoditi = KOMODITI_JABAR.slice(0, 6);

      for (const komoditi of selectedKomoditi) {
        const yearFactor = 1 + ((tahun - 2013) * 0.02);
        const randomVariation = 0.85 + seededRandom(seedCounter++) * 0.30;

        const produktivitas = Math.round(
          (baseProductivity[komoditi] || 5000) * yearFactor * randomVariation
        );

        const luas_lahan = Math.round(
          ((baseLandSize[wilayah] || 50000) / 10) * (0.8 + seededRandom(seedCounter++) * 0.4)
        );

        data.push({
          id: id.toString(),
          komoditi,
          produktivitas,
          tahun,
          wilayah,
          luas_lahan,
          status: seededRandom(seedCounter++) > 0.1 ? 'aktif' : 'tidak_aktif',
        });
        id++;
      }
    }
  }

  return data;
}

// In-memory data store
let commodities: Commodity[] = generateMockData();

/**
 * Server-side data fetching for SSR
 * This runs on the server for optimal initial page load
 */
export async function fetchCommoditiesSSR(): Promise<Commodity[]> {
  // Simulate minimal server-side delay
  await new Promise((resolve) => setTimeout(resolve, 50));
  return commodities;
}

export async function fetchFilteredCommodities(filters: {
  wilayah?: string | null;
  tahun?: number | null;
  komoditi?: string | null;
}): Promise<Commodity[]> {
  return commodities.filter((c) => {
    if (filters.wilayah && c.wilayah !== filters.wilayah) return false;
    if (filters.tahun && c.tahun !== filters.tahun) return false;
    if (filters.komoditi && c.komoditi !== filters.komoditi) return false;
    return true;
  });
}

export async function createCommodity(data: CommodityFormData): Promise<Commodity> {
  const newCommodity: Commodity = {
    id: Date.now().toString(),
    ...data,
  };
  commodities = [...commodities, newCommodity];
  return newCommodity;
}

export async function updateCommodity(
  id: string,
  data: Partial<CommodityFormData>
): Promise<Commodity | null> {
  const index = commodities.findIndex((c) => c.id === id);
  if (index === -1) return null;

  commodities[index] = { ...commodities[index], ...data };
  return commodities[index];
}

export async function deleteCommodity(id: string): Promise<boolean> {
  const initialLength = commodities.length;
  commodities = commodities.filter((c) => c.id !== id);
  return commodities.length < initialLength;
}

/**
 * Analytics: Calculate productivity growth/decline percentage
 */
export async function calculateProductivityAnalytics(
  wilayah?: string | null,
  komoditi?: string | null
): Promise<{
  growthRate: number;
  trend: 'up' | 'down' | 'stable';
  yearlyComparison: { year: number; productivity: number; change: number }[];
}> {
  let filtered = commodities;
  if (wilayah) filtered = filtered.filter((c) => c.wilayah === wilayah);
  if (komoditi) filtered = filtered.filter((c) => c.komoditi === komoditi);

  // Group by year
  const yearlyData: Record<number, number[]> = {};
  filtered.forEach((c) => {
    if (!yearlyData[c.tahun]) yearlyData[c.tahun] = [];
    yearlyData[c.tahun].push(c.produktivitas);
  });

  // Calculate average per year
  const yearlyAverages = Object.entries(yearlyData)
    .map(([year, values]) => ({
      year: parseInt(year),
      productivity: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    }))
    .sort((a, b) => a.year - b.year);

  // Calculate year-over-year changes
  const yearlyComparison = yearlyAverages.map((data, index) => {
    if (index === 0) return { ...data, change: 0 };
    const prevYear = yearlyAverages[index - 1];
    const change = prevYear.productivity > 0
      ? parseFloat((((data.productivity - prevYear.productivity) / prevYear.productivity) * 100).toFixed(1))
      : 0;
    return { ...data, change };
  });

  // Calculate overall growth rate (first year vs last year)
  const firstYear = yearlyAverages[0];
  const lastYear = yearlyAverages[yearlyAverages.length - 1];
  const growthRate = firstYear && lastYear && firstYear.productivity > 0
    ? parseFloat((((lastYear.productivity - firstYear.productivity) / firstYear.productivity) * 100).toFixed(1))
    : 0;

  const trend = growthRate > 2 ? 'up' : growthRate < -2 ? 'down' : 'stable';

  return { growthRate, trend, yearlyComparison };
}

/**
 * Regional Analytics: Compare district performance
 */
export async function getRegionalAnalytics(
  tahun?: number | null
): Promise<{
  wilayah: string;
  avgProductivity: number;
  totalLand: number;
  growthRate: number;
  topCommodity: string;
}[]> {
  const targetYear = tahun || 2024;
  const prevYear = targetYear - 1;

  return WILAYAH_JABAR.map((wilayah) => {
    const currentData = commodities.filter((c) => c.wilayah === wilayah && c.tahun === targetYear);
    const prevData = commodities.filter((c) => c.wilayah === wilayah && c.tahun === prevYear);

    const avgProductivity = currentData.length > 0
      ? Math.round(currentData.reduce((sum, c) => sum + c.produktivitas, 0) / currentData.length)
      : 0;

    const prevAvgProductivity = prevData.length > 0
      ? Math.round(prevData.reduce((sum, c) => sum + c.produktivitas, 0) / prevData.length)
      : 0;

    const totalLand = currentData.reduce((sum, c) => sum + c.luas_lahan, 0);

    const growthRate = prevAvgProductivity > 0
      ? parseFloat((((avgProductivity - prevAvgProductivity) / prevAvgProductivity) * 100).toFixed(1))
      : 0;

    // Find top commodity by productivity
    const commodityProductivity = currentData.reduce((acc, c) => {
      if (!acc[c.komoditi] || c.produktivitas > acc[c.komoditi]) {
        acc[c.komoditi] = c.produktivitas;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCommodity = Object.entries(commodityProductivity)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '-';

    return { wilayah, avgProductivity, totalLand, growthRate, topCommodity };
  }).sort((a, b) => b.avgProductivity - a.avgProductivity);
}
