import { Suspense } from 'react';
import { fetchCommoditiesSSR } from '@/lib/actions/commodity-actions';
import { DashboardApp } from '@/components/dashboard/dashboard-app';

/**
 * Home Page - Server Component with SSR
 * Fetches initial commodity data on the server for optimal performance
 */
export default async function Home() {
  // SSR: Fetch data on the server for initial load
  const initialCommodities = await fetchCommoditiesSSR();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm text-slate-500">Memuat data...</p>
          </div>
        </div>
      }
    >
      <DashboardApp initialCommodities={initialCommodities} />
    </Suspense>
  );
}
