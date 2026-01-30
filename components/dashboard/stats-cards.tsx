'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandPlot, Wheat, TrendingUp, MapPin } from 'lucide-react';

interface StatsCardsProps {
  totalLahan: number;
  totalKomoditi: number;
  rataProduktivitas: number;
  wilayahTerbesar: string;
}

export function StatsCards({
  totalLahan,
  totalKomoditi,
  rataProduktivitas,
  wilayahTerbesar,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Luas Lahan',
      value: `${totalLahan.toLocaleString('id-ID')} Ha`,
      icon: LandPlot,
      description: 'Lahan aktif terdaftar',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Jenis Komoditi',
      value: totalKomoditi.toString(),
      icon: Wheat,
      description: 'Komoditi tercatat',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Rata-rata Produktivitas',
      value: `${rataProduktivitas.toLocaleString('id-ID')} Kg/Ha`,
      icon: TrendingUp,
      description: 'Produktivitas tanaman',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Wilayah Terbesar',
      value: wilayahTerbesar,
      icon: MapPin,
      description: 'Area lahan terluas',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
