'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { AIAssistantDrawer } from '@/components/intelligence/AIAssistantDrawer';
import { PurchaseOrderModal } from '@/components/intelligence/PurchaseOrderModal';

export function AdminLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [poTargetItem, setPoTargetItem] = useState(null);

  // Global event listeners for cross-page intelligent actions
  useEffect(() => {
    const handleOpenPO = (e) => {
      setPoTargetItem(e.detail || null);
      setIsPOModalOpen(true);
    };
    const handleOpenAI = () => {
      setIsAIAssistantOpen(true);
    };

    window.addEventListener('open-po-modal', handleOpenPO);
    window.addEventListener('open-ai-drawer', handleOpenAI);

    return () => {
      window.removeEventListener('open-po-modal', handleOpenPO);
      window.removeEventListener('open-ai-drawer', handleOpenAI);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-app-font transition-colors duration-200">
      {/* Admin Sidebar Navigation */}
      <Sidebar
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
        {/* Admin Navbar */}
        <Navbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Admin AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        role="ADMIN"
        onOpenPOModal={() => {
          setPoTargetItem(null);
          setIsPOModalOpen(true);
        }}
      />

      {/* Admin Purchase Order Creator Modal */}
      <PurchaseOrderModal
        isOpen={isPOModalOpen}
        onClose={() => {
          setIsPOModalOpen(false);
          setPoTargetItem(null);
        }}
        initialItem={poTargetItem}
        onOrderCreated={(newPO) => {
          window.dispatchEvent(new CustomEvent('po-created', { detail: newPO }));
        }}
      />
    </div>
  );
}
