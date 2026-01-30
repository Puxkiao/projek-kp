'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, UserRole, LoginFormData, RegisterFormData } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    nama: 'Admin Disbun',
    email: 'admin@disbun.go.id',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    nama: 'Petani Garut',
    email: 'petani@garut.com',
    password: 'petani123',
    role: 'petani',
    wilayah: 'Garut',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (data: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(
      (u) => u.email === data.email && u.password === data.password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return { success: true };
    }

    return { success: false, error: 'Email atau kata sandi salah' };
  }, []);

  const register = useCallback(async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if email exists
    if (mockUsers.some((u) => u.email === data.email)) {
      return { success: false, error: 'Email sudah terdaftar' };
    }

    // Create new user
    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      nama: data.nama,
      email: data.email,
      password: data.password,
      role: data.role,
      wilayah: data.wilayah,
    };

    mockUsers.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    return { success: true };
  }, []);

  const updateProfile = useCallback(async (data: { nama?: string; email?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User not authenticated' };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userIndex = mockUsers.findIndex((u) => u.id === user.id);
    if (userIndex === -1) return { success: false, error: 'User not found' };

    // Validate current password if changing password
    if (data.newPassword) {
      if (mockUsers[userIndex].password !== data.currentPassword) {
        return { success: false, error: 'Kata sandi saat ini salah' };
      }
      mockUsers[userIndex].password = data.newPassword;
    }

    // Update user data
    if (data.nama) mockUsers[userIndex].nama = data.nama;
    if (data.email) mockUsers[userIndex].email = data.email;

    const { password: _, ...updatedUser } = mockUsers[userIndex];
    setUser(updatedUser);

    return { success: true };
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
