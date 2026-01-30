'use client';

import React from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Sprout,
  BarChart3,
  Settings,
  Leaf,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '#dashboard' },
  { label: 'Komoditas', icon: Sprout, href: '#commodities', adminOnly: true },
  { label: 'Statistik', icon: BarChart3, href: '#statistics' },
  { label: 'Pengaturan', icon: Settings, href: '#settings' },
];

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
}

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const { user, isAdmin, logout } = useAuth();

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-emerald-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-emerald-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
          <Leaf className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold">DISBUN</h1>
          <p className="text-xs text-emerald-300">Jawa Barat</p>
        </div>
      </div>

      {/* User Info */}
      <div className="border-b border-emerald-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-semibold">
            {user?.nama.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{user?.nama}</p>
            <p className="truncate text-xs text-emerald-300">
              {isAdmin ? 'Admin Disbun' : `Petani - ${user?.wilayah}`}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.href;

          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-emerald-800 p-4">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start text-emerald-100 hover:bg-emerald-800 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
        <div className="mt-3 rounded-lg bg-emerald-800/50 p-3">
          <p className="text-xs text-emerald-300">Sistem Monitoring Pertanian</p>
          <p className="text-sm font-medium text-emerald-100">Jawa Barat v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
