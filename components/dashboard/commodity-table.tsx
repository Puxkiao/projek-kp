'use client';

import { useState } from 'react';
import { Commodity, FormErrors, WILAYAH_JABAR, KOMODITI_JABAR } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface CommodityTableProps {
  commodities: Commodity[];
  onEdit: (id: string, data: Partial<Commodity>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function CommodityTable({
  commodities,
  onEdit,
  onDelete,
  isLoading,
}: CommodityTableProps) {
  const [editingCommodity, setEditingCommodity] = useState<Commodity | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    komoditi: '',
    produktivitas: '',
    tahun: '',
    wilayah: '',
    luas_lahan: '',
    status: 'aktif' as 'aktif' | 'tidak_aktif',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (commodity: Commodity) => {
    setEditingCommodity(commodity);
    setEditForm({
      komoditi: commodity.komoditi,
      produktivitas: commodity.produktivitas.toString(),
      tahun: commodity.tahun.toString(),
      wilayah: commodity.wilayah,
      luas_lahan: commodity.luas_lahan.toString(),
      status: commodity.status,
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!editForm.komoditi.trim()) {
      newErrors.komoditi = 'Komoditi wajib dipilih';
    }

    const produktivitas = parseFloat(editForm.produktivitas);
    if (!editForm.produktivitas || isNaN(produktivitas) || produktivitas <= 0) {
      newErrors.produktivitas = 'Produktivitas harus berupa angka positif';
    }

    const tahun = parseInt(editForm.tahun);
    if (!editForm.tahun || isNaN(tahun) || tahun < 2013 || tahun > 2025) {
      newErrors.tahun = 'Tahun harus antara 2013-2025';
    }

    if (!editForm.wilayah.trim()) {
      newErrors.wilayah = 'Wilayah wajib dipilih';
    }

    const luas_lahan = parseFloat(editForm.luas_lahan);
    if (!editForm.luas_lahan || isNaN(luas_lahan) || luas_lahan <= 0) {
      newErrors.luas_lahan = 'Luas lahan harus berupa angka positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !editingCommodity) return;

    setIsSaving(true);
    try {
      await onEdit(editingCommodity.id, {
        komoditi: editForm.komoditi,
        produktivitas: parseFloat(editForm.produktivitas),
        tahun: parseInt(editForm.tahun),
        wilayah: editForm.wilayah,
        luas_lahan: parseFloat(editForm.luas_lahan),
        status: editForm.status,
      });
      setEditingCommodity(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">Komoditi</TableHead>
              <TableHead className="font-semibold text-slate-700">Wilayah</TableHead>
              <TableHead className="font-semibold text-slate-700">Tahun</TableHead>
              <TableHead className="font-semibold text-slate-700">Produktivitas (Kg/Ha)</TableHead>
              <TableHead className="font-semibold text-slate-700">Luas Lahan (Ha)</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commodities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                  Tidak ada data komoditas
                </TableCell>
              </TableRow>
            ) : (
              commodities.map((commodity) => (
                <TableRow key={commodity.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">{commodity.komoditi}</TableCell>
                  <TableCell className="text-slate-600">{commodity.wilayah}</TableCell>
                  <TableCell className="text-slate-600">{commodity.tahun}</TableCell>
                  <TableCell className="text-slate-600">
                    {commodity.produktivitas.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {commodity.luas_lahan.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        commodity.status === 'aktif'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {commodity.status === 'aktif' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {commodity.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(commodity)}
                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(commodity.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingCommodity} onOpenChange={() => setEditingCommodity(null)}>
        <DialogContent className="bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Edit Data Komoditas</DialogTitle>
            <DialogDescription className="text-slate-500">
              Perbarui informasi data pertanian
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-komoditi" className="text-slate-700">Komoditi</Label>
                <Select
                  value={editForm.komoditi}
                  onValueChange={(value) => setEditForm({ ...editForm, komoditi: value })}
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
                <Label htmlFor="edit-wilayah" className="text-slate-700">Wilayah</Label>
                <Select
                  value={editForm.wilayah}
                  onValueChange={(value) => setEditForm({ ...editForm, wilayah: value })}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tahun" className="text-slate-700">Tahun</Label>
                <Input
                  id="edit-tahun"
                  type="number"
                  value={editForm.tahun}
                  onChange={(e) => setEditForm({ ...editForm, tahun: e.target.value })}
                  className={errors.tahun ? 'border-red-500' : 'border-slate-200'}
                />
                {errors.tahun && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {errors.tahun}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-produktivitas" className="text-slate-700">Produktivitas (Kg/Ha)</Label>
                <Input
                  id="edit-produktivitas"
                  type="number"
                  value={editForm.produktivitas}
                  onChange={(e) => setEditForm({ ...editForm, produktivitas: e.target.value })}
                  className={errors.produktivitas ? 'border-red-500' : 'border-slate-200'}
                />
                {errors.produktivitas && (
                  <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {errors.produktivitas}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-luas_lahan" className="text-slate-700">Luas Lahan (Ha)</Label>
                <Input
                  id="edit-luas_lahan"
                  type="number"
                  value={editForm.luas_lahan}
                  onChange={(e) => setEditForm({ ...editForm, luas_lahan: e.target.value })}
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
                <Label htmlFor="edit-status" className="text-slate-700">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: 'aktif' | 'tidak_aktif') => setEditForm({ ...editForm, status: value })}
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingCommodity(null)}
              className="border-slate-200 text-slate-600"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Hapus Data</DialogTitle>
            <DialogDescription className="text-slate-500">
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="border-slate-200 text-slate-600"
            >
              Batal
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
