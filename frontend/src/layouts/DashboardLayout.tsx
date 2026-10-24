import React from 'react';
import { MainLayout } from './MainLayout';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MainLayout>{children}</MainLayout>;
};

export default DashboardLayout;
