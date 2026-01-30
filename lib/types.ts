// Commodity interface based on CSV structure
export interface Commodity {
  id: string;
  komoditi: string;
  produktivitas: number; // Kg/Ha
  tahun: number;
  wilayah: string; // Kabupaten/Kota
  luas_lahan: number; // Ha
  status: 'aktif' | 'tidak_aktif';
}

// User role types
export type UserRole = 'admin' | 'petani';

// User interface for authentication
export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  wilayah?: string; // For Petani, their assigned region
}

// Form data for creating/editing commodities
export interface CommodityFormData {
  komoditi: string;
  produktivitas: number;
  tahun: number;
  wilayah: string;
  luas_lahan: number;
  status: 'aktif' | 'tidak_aktif';
}

// Validation errors
export interface FormErrors {
  komoditi?: string;
  produktivitas?: string;
  tahun?: string;
  wilayah?: string;
  luas_lahan?: string;
  status?: string;
}

// Auth form data
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  nama: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  wilayah?: string;
}

// West Java regions
export const WILAYAH_JABAR = [
  'Garut',
  'Bandung',
  'Sukabumi',
  'Cianjur',
  'Tasikmalaya',
  'Ciamis',
  'Kuningan',
  'Majalengka',
  'Sumedang',
  'Subang',
  'Purwakarta',
  'Karawang',
  'Bekasi',
  'Bogor',
  'Cirebon',
] as const;

export type WilayahJabar = (typeof WILAYAH_JABAR)[number];

// Commodity types in West Java
export const KOMODITI_JABAR = [
  'Padi',
  'Jagung',
  'Kedelai',
  'Kacang Tanah',
  'Ubi Kayu',
  'Ubi Jalar',
  'Sayuran',
  'Buah-buahan',
  'Kopi',
  'Teh',
  'Kelapa',
  'Cengkeh',
] as const;

export type KomoditiJabar = (typeof KOMODITI_JABAR)[number];
