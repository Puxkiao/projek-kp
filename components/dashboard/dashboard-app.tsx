'use client';

import { useState, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/lib/context/auth-context';
import { FilterProvider, useFilter } from '@/lib/context/role-context';
import { Commodity, CommodityFormData } from '@/lib/types';
import {
  createCommodity,
  updateCommodity,
  deleteCommodity,
  fetchCommoditiesSSR,
} from '@/lib/actions/commodity-actions';
import { Sidebar } from '@/components/dashboard/sidebar';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { FarmerDashboard } from '@/components/dashboard/farmer-dashboard';
import { SettingsPage } from '@/components/dashboard/settings-page';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Bell, Menu, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardAppProps {
  initialCommodities: Commodity[];
}

function DashboardContent({ initialCommodities }: { initialCommodities: Commodity[] }) {
  const { user, isAdmin } = useAuth();
  const [commodities, setCommodities] = useState<Commodity[]>(initialCommodities);
  const [isPending, startTransition] = useTransition();
  const [activeNav, setActiveNav] = useState('#dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refresh data from server
  const refreshData = useCallback(() => {
    startTransition(async () => {
      const data = await fetchCommoditiesSSR();
      setCommodities(data);
    });
  }, []);

  // CRUD operations using server actions
  const handleCreateCommodity = useCallback(async (data: CommodityFormData) => {
    const newCommodity = await createCommodity(data);
    setCommodities((prev) => [...prev, newCommodity]);
  }, []);

  const handleUpdateCommodity = useCallback(async (id: string, data: Partial<Commodity>) => {
    const updated = await updateCommodity(id, data);
    if (updated) {
      setCommodities((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }, []);

  const handleDeleteCommodity = useCallback(async (id: string) => {
    const success = await deleteCommodity(id);
    if (success) {
      setCommodities((prev) => prev.filter((c) => c.id !== id));
    }
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-40 lg:hidden"
          >
            <Sidebar
              activeItem={activeNav}
              onNavigate={(item) => {
                setActiveNav(item);
                setIsMobileMenuOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsMobileMenuOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <div className="ml-12 flex items-center gap-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-slate-900">
              Sistem Monitoring Pertanian Jawa Barat
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshData}
              disabled={isPending}
              className="text-slate-600"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${isPending ? 'animate-spin' : ''}`} />
            </Button>

            <Button variant="ghost" size="icon" className="relative text-slate-600">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-medium text-white">
                {user?.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{user?.nama}</p>
                <p className="text-xs text-slate-500">
                  {isAdmin ? 'Admin Disbun' : `Petani - ${user?.wilayah}`}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {isAdmin ? 'Dashboard Admin Disbun' : 'Dashboard Petani'}
            </h1>
            <p className="text-slate-500">
              {isAdmin
                ? 'Kelola data komoditas dan analisis pertanian Jawa Barat'
                : `Pantau statistik pertanian wilayah ${user?.wilayah || 'Anda'}`}
            </p>
          </div>

          {/* Dashboard Content with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isAdmin ? 'admin' : 'farmer'}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {isAdmin ? (
                <AdminDashboard
                  commodities={commodities}
                  isLoading={isPending}
                  onCreateCommodity={handleCreateCommodity}
                  onUpdateCommodity={handleUpdateCommodity}
                  onDeleteCommodity={handleDeleteCommodity}
                />
              ) : (
                <FarmerDashboard
                  commodities={commodities}
                  isLoading={isPending}
                  restrictedWilayah={user?.wilayah}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function AuthWrapper({ initialCommodities }: { initialCommodities: Commodity[] }) {
  const { isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!isAuthenticated) {
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <FilterProvider>
      <DashboardContent initialCommodities={initialCommodities} />
    </FilterProvider>
  );
}

export function DashboardApp({ initialCommodities }: DashboardAppProps) {
  return (
    <AuthProvider>
      <AuthWrapper initialCommodities={initialCommodities} />
    </AuthProvider>
  );
}
