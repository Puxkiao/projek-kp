// Form data for creating/editing commodities
export interface CommodityFormData {
  komoditi: string;
  produktivitas: number;
  tahun: number;
  wilayah: string;
  luas_lahan: number;
  status: 'aktif' | 'tidak_aktif';
  deskripsi?: string;
  catatan?: string;
}
=======
// Form data for creating/editing commodities
export interface CommodityFormData {
  komoditi: string;
  produktivitas: number;
  tahun: number;
  wilayah: string;
  luas_lahan: number;
  status: 'aktif' | 'tidak_aktif';
  deskripsi?: string;
  catatan?: string;
}
