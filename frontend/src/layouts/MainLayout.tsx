import React from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
    <Header />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
    <Footer />
  </div>
);
