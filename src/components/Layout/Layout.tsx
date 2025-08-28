import React from 'react';
import { Header } from './Header';
import { FooterNav } from './FooterNav';   // ⬅️ import footer
import { RunnerAnimation } from '../Animation/RunnerAnimation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="relative">
        {children}
      </main>
      <RunnerAnimation />
      <FooterNav />
    </div>
  );
};