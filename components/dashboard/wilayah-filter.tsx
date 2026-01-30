'use client';

import { memo, useCallback } from 'react';
import { useFilter } from '@/lib/context/role-context';
import { WILAYAH_JABAR, KOMODITI_JABAR } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Wheat, X, Filter } from 'lucide-react';

const YEARS = Array.from({ length: 12 }, (_, i) => 2024 - i);

interface WilayahFilterProps {
  restrictedWilayah?: string;
}

/**
 * WilayahFilter - Memoized for zero-lag interactions
 * Uses React.memo to prevent unnecessary re-renders when parent state changes
 */
function WilayahFilterComponent({ restrictedWilayah }: WilayahFilterProps) {
  const {
    selectedWilayah,
    setSelectedWilayah,
    selectedTahun,
    setSelectedTahun,
    selectedKomoditi,
    setSelectedKomoditi,
  } = useFilter();

  // Memoized callbacks to prevent re-renders
  const handleWilayahChange = useCallback(
    (value: string) => {
      setSelectedWilayah(value === 'all' ? null : value);
    },
    [setSelectedWilayah]
  );

  const handleTahunChange = useCallback(
    (value: string) => {
      setSelectedTahun(value === 'all' ? null : parseInt(value));
    },
    [setSelectedTahun]
  );

  const handleKomoditiChange = useCallback(
    (value: string) => {
      setSelectedKomoditi(value === 'all' ? null : value);
    },
    [setSelectedKomoditi]
  );

  const clearFilters = useCallback(() => {
    if (!restrictedWilayah) {
      setSelectedWilayah(null);
    }
    setSelectedTahun(2024);
    setSelectedKomoditi(null);
  }, [restrictedWilayah, setSelectedWilayah, setSelectedTahun, setSelectedKomoditi]);

  const hasActiveFilters = selectedWilayah || selectedTahun !== 2024 || selectedKomoditi;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Filter className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-medium text-slate-700">Filter Data</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Wilayah Filter */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <Select
            value={restrictedWilayah || selectedWilayah || 'all'}
            onValueChange={handleWilayahChange}
            disabled={!!restrictedWilayah}
          >
            <SelectTrigger className="w-44 border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100">
              <SelectValue placeholder="Semua Wilayah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Wilayah</SelectItem>
              {WILAYAH_JABAR.map((wilayah) => (
                <SelectItem key={wilayah} value={wilayah}>
                  {wilayah}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tahun Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <Select
            value={selectedTahun?.toString() || 'all'}
            onValueChange={handleTahunChange}
          >
            <SelectTrigger className="w-36 border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Komoditi Filter */}
        <div className="flex items-center gap-2">
          <Wheat className="h-4 w-4 text-slate-400" />
          <Select
            value={selectedKomoditi || 'all'}
            onValueChange={handleKomoditiChange}
          >
            <SelectTrigger className="w-44 border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100">
              <SelectValue placeholder="Semua Komoditi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Komoditi</SelectItem>
              {KOMODITI_JABAR.map((komoditi) => (
                <SelectItem key={komoditi} value={komoditi}>
                  {komoditi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <X className="mr-1 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

// Export memoized component for performance optimization
export const WilayahFilter = memo(WilayahFilterComponent);
