'use client';

import React from 'react';
import { useState } from 'react';
import { CommodityFormData, FormErrors, WILAYAH_JABAR, KOMODITI_JABAR } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Plus, Check } from 'lucide-react';

interface CommodityFormProps {
  onSubmit: (data: CommodityFormData) => Promise<void>;
}

export function CommodityForm({ onSubmit }: CommodityFormProps) {
  const [formData, setFormData] = useState({
    komoditi: '',
    produktivitas: '',
    tahun: '2025',
    wilayah: '',
    luas_lahan: '',
    status: 'aktif' as 'aktif' | 'tidak_aktif',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.komoditi) {
      newErrors.komoditi = 'Komoditi wajib dipilih';
    }

    const produktivitas = parseFloat(formData.produktivitas);
    if (!formData.produktivitas) {
      newErrors.produktivitas = 'Produktivitas wajib diisi';
    } else if (isNaN(produktivitas)) {
      newErrors.produktivitas = 'Produktivitas harus berupa angka';
    } else if (produktivitas <= 0) {
      newErrors.produktivitas = 'Produktivitas harus lebih dari 0';
    }

    const tahun = parseInt(formData.tahun);
    if (!formData.tahun) {
      newErrors.tahun = 'Tahun wajib diisi';
    } else if (isNaN(tahun) || tahun < 2013 || tahun > 2025) {
      newErrors.tahun = 'Tahun harus antara 2013-2025';
    }

    if (!formData.wilayah) {
      newErrors.wilayah = 'Wilayah wajib dipilih';
    }

    const luas_lahan = parseFloat(formData.luas_lahan);
    if (!formData.luas_lahan) {
      newErrors.luas_lahan = 'Luas lahan wajib diisi';
    } else if (isNaN(luas_lahan)) {
      newErrors.luas_lahan = 'Luas lahan harus berupa angka';
    } else if (luas_lahan <= 0) {
      newErrors.luas_lahan = 'Luas lahan harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        komoditi: formData.komoditi,
        produktivitas: parseFloat(formData.produktivitas),
        tahun: parseInt(formData.tahun),
        wilayah: formData.wilayah,
        luas_lahan: parseFloat(formData.luas_lahan),
        status: formData.status,
      });

      // Reset form
      setFormData({
        komoditi: '',
        produktivitas: '',
        tahun: '2025',
        wilayah: '',
        luas_lahan: '',
        status: 'aktif',
      });
      setErrors({});
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Plus className="h-5 w-5 text-emerald-600" />
          Tambah Data Komoditas Baru
        </CardTitle>
        <CardDescription className="text-slate-500">
          Masukkan data komoditas pertanian tahun 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="komoditi" className="text-slate-700">
                Komoditi
              </Label>
              <Select
                value={formData.komoditi}
                onValueChange={(value) => setFormData({ ...formData, komoditi: value })}
              >
                <SelectTrigger className={errors.komoditi ? 'border-red-500' : 'border-slate-200'}>
                  <SelectValue placeholder="Pilih komoditi" />
                </SelectTrigger>
                <SelectContent>
                  {KOMODITI_JABAR.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.komoditi && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {errors.komoditi}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wilayah" className="text-slate-700">
                Wilayah
              </Label>
              <Select
                value={formData.wilayah}
                onValueChange={(value) => setFormData({ ...formData, wilayah: value })}
              >
                <SelectTrigger className={errors.wilayah ? 'border-red-500' : 'border-slate-200'}>
                  <SelectValue placeholder="Pilih wilayah" />
                </SelectTrigger>
                <SelectContent>
                  {WILAYAH_JABAR.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.wilayah && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {errors.wilayah}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tahun" className="text-slate-700">
                Tahun
              </Label>
              <Input
                id="tahun"
                type="number"
                placeholder="2025"
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                className={errors.tahun ? 'border-red-500' : 'border-slate-200'}
              />
              {errors.tahun && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {errors.tahun}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="produktivitas" className="text-slate-700">
                Produktivitas (Kg/Ha)
              </Label>
              <Input
                id="produktivitas"
                type="number"
                placeholder="Contoh: 5500"
                value={formData.produktivitas}
                onChange={(e) => setFormData({ ...formData, produktivitas: e.target.value })}
                className={errors.produktivitas ? 'border-red-500' : 'border-slate-200'}
              />
              {errors.produktivitas && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {errors.produktivitas}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="luas_lahan" className="text-slate-700">
                Luas Lahan (Ha)
              </Label>
              <Input
                id="luas_lahan"
                type="number"
                placeholder="Contoh: 1000"
                value={formData.luas_lahan}
                onChange={(e) => setFormData({ ...formData, luas_lahan: e.target.value })}
                className={errors.luas_lahan ? 'border-red-500' : 'border-slate-200'}
              />
              {errors.luas_lahan && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {errors.luas_lahan}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'aktif' | 'tidak_aktif') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Data
                </>
              )}
            </Button>

            {showSuccess && (
              <div className="flex items-center gap-2 text-emerald-600">
                <Check className="h-5 w-5" />
                <span className="text-sm font-medium">Data berhasil ditambahkan!</span>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
