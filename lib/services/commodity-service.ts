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

  // Generate data for years 2013-2024
  for (let tahun = 2013; tahun <= 2024; tahun++) {
    // Select 3-4 commodities per region per year for realistic data
    for (const wilayah of WILAYAH_JABAR) {
      const selectedKomoditi = KOMODITI_JABAR.slice(0, Math.floor(Math.random() * 3) + 4);
      
      for (const komoditi of selectedKomoditi) {
        // Add some yearly variation (+/- 15%)
        const yearFactor = 1 + ((tahun - 2013) * 0.02); // Slight increase over years
        const randomVariation = 0.85 + Math.random() * 0.30;
        
        const produktivitas = Math.round(
          (baseProductivity[komoditi] || 5000) * yearFactor * randomVariation
        );
        
        const luas_lahan = Math.round(
          ((baseLandSize[wilayah] || 50000) / 10) * randomVariation
        );

        data.push({
          id: id.toString(),
          komoditi,
          produktivitas,
          tahun,
          wilayah,
          luas_lahan,
          status: Math.random() > 0.1 ? 'aktif' : 'tidak_aktif',
        });
        id++;
      }
    }
  }

  return data;
}

// In-memory data store (simulates database)
let commodities: Commodity[] = generateMockData();

// Mock delay to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock Service for Commodity CRUD operations
 * This pattern makes it easy to swap with a real API (Supabase/PostgreSQL) later
 */
export const CommodityService = {
  // Get all commodities
  async getAll(): Promise<Commodity[]> {
    await delay(300);
    return [...commodities];
  },

  // Get commodities by wilayah
  async getByWilayah(wilayah: string): Promise<Commodity[]> {
    await delay(200);
    return commodities.filter((c) => c.wilayah === wilayah);
  },

  // Get commodities by tahun
  async getByTahun(tahun: number): Promise<Commodity[]> {
    await delay(200);
    return commodities.filter((c) => c.tahun === tahun);
  },

  // Get commodities with filters
  async getFiltered(filters: {
    wilayah?: string;
    tahun?: number;
    komoditi?: string;
  }): Promise<Commodity[]> {
    await delay(300);
    return commodities.filter((c) => {
      if (filters.wilayah && c.wilayah !== filters.wilayah) return false;
      if (filters.tahun && c.tahun !== filters.tahun) return false;
      if (filters.komoditi && c.komoditi !== filters.komoditi) return false;
      return true;
    });
  },

  // Get commodity by ID
  async getById(id: string): Promise<Commodity | undefined> {
    await delay(200);
    return commodities.find((c) => c.id === id);
  },

  // Create new commodity
  async create(data: CommodityFormData): Promise<Commodity> {
    await delay(400);
    const newCommodity: Commodity = {
      id: Date.now().toString(),
      ...data,
    };
    commodities = [...commodities, newCommodity];
    return newCommodity;
  },

  // Update existing commodity
  async update(id: string, data: Partial<CommodityFormData>): Promise<Commodity | undefined> {
    await delay(400);
    const index = commodities.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    commodities[index] = {
      ...commodities[index],
      ...data,
    };
    return commodities[index];
  },

  // Delete commodity
  async delete(id: string): Promise<boolean> {
    await delay(300);
    const initialLength = commodities.length;
    commodities = commodities.filter((c) => c.id !== id);
    return commodities.length < initialLength;
  },

  // Get productivity trend by commodity and wilayah
  async getProductivityTrend(komoditi: string, wilayah?: string): Promise<{ tahun: number; produktivitas: number }[]> {
    await delay(200);
    const filtered = commodities
      .filter((c) => c.komoditi === komoditi && (!wilayah || c.wilayah === wilayah))
      .sort((a, b) => a.tahun - b.tahun);

    // Group by year and calculate average
    const grouped = filtered.reduce((acc, c) => {
      if (!acc[c.tahun]) {
        acc[c.tahun] = { total: 0, count: 0 };
      }
      acc[c.tahun].total += c.produktivitas;
      acc[c.tahun].count++;
      return acc;
    }, {} as Record<number, { total: number; count: number }>);

    return Object.entries(grouped).map(([tahun, data]) => ({
      tahun: parseInt(tahun),
      produktivitas: Math.round(data.total / data.count),
    }));
  },

  // Get statistics
  async getStats(wilayah?: string): Promise<{
    totalLahan: number;
    totalKomoditi: number;
    rataProduktivitas: number;
    wilayahTerbesar: string;
  }> {
    await delay(200);
    const latestYear = Math.max(...commodities.map((c) => c.tahun));
    const filtered = commodities.filter(
      (c) => c.tahun === latestYear && (!wilayah || c.wilayah === wilayah)
    );

    const totalLahan = filtered.reduce((sum, c) => sum + c.luas_lahan, 0);
    const uniqueKomoditi = new Set(filtered.map((c) => c.komoditi)).size;
    const rataProduktivitas = filtered.length > 0
      ? Math.round(filtered.reduce((sum, c) => sum + c.produktivitas, 0) / filtered.length)
      : 0;

    // Find wilayah with most land
    const wilayahLand = filtered.reduce((acc, c) => {
      acc[c.wilayah] = (acc[c.wilayah] || 0) + c.luas_lahan;
      return acc;
    }, {} as Record<string, number>);

    const wilayahTerbesar = Object.entries(wilayahLand)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '-';

    return { totalLahan, totalKomoditi: uniqueKomoditi, rataProduktivitas, wilayahTerbesar };
  },

  // Get unique years
  async getYears(): Promise<number[]> {
    await delay(100);
    return [...new Set(commodities.map((c) => c.tahun))].sort((a, b) => b - a);
  },

  // Reset data (for testing)
  async reset(): Promise<void> {
    await delay(100);
    commodities = generateMockData();
  },
};
