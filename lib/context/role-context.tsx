'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  selectedWilayah: string | null;
  setSelectedWilayah: (wilayah: string | null) => void;
  selectedTahun: number | null;
  setSelectedTahun: (tahun: number | null) => void;
  selectedKomoditi: string | null;
  setSelectedKomoditi: (komoditi: string | null) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedWilayah, setSelectedWilayah] = useState<string | null>(null);
  const [selectedTahun, setSelectedTahun] = useState<number | null>(2024);
  const [selectedKomoditi, setSelectedKomoditi] = useState<string | null>(null);

  return (
    <FilterContext.Provider
      value={{
        selectedWilayah,
        setSelectedWilayah,
        selectedTahun,
        setSelectedTahun,
        selectedKomoditi,
        setSelectedKomoditi,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
