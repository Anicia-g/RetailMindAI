'use client';

import React, { useState, useEffect } from 'react';
import { SellerSidebar } from './SellerSidebar';
import { SellerNavbar } from './SellerNavbar';
import { RecordSaleModal } from './RecordSaleModal';
import { AIAssistantDrawer } from '@/components/intelligence/AIAssistantDrawer';

export function SellerLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);

  useEffect(() => {
    const handleOpenRecordSale = () => {
      setIsRecordSaleOpen(true);
    };
    const handleOpenAI = () => {
      setIsAIAssistantOpen(true);
    };

    window.addEventListener('open-record-sale-modal', handleOpenRecordSale);
    window.addEventListener('open-ai-drawer', handleOpenAI);

    return () => {
      window.removeEventListener('open-record-sale-modal', handleOpenRecordSale);
      window.removeEventListener('open-ai-drawer', handleOpenAI);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-app-font transition-colors duration-200">
      {/* Seller Sidebar Navigation */}
      <SellerSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Seller Navbar */}
        <SellerNavbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          onOpenRecordSale={() => setIsRecordSaleOpen(true)}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Seller AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        role="SELLER"
      />

      {/* Quick Shift POS Record Sale Modal */}
      <RecordSaleModal
        isOpen={isRecordSaleOpen}
        onClose={() => setIsRecordSaleOpen(false)}
        onSaleRecorded={(sale) => {
          window.dispatchEvent(new CustomEvent('seller-sale-recorded', { detail: sale }));
        }}
      />
    </div>
  );
}
