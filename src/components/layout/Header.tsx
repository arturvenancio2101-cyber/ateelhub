'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, Sun, Moon, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onOpenNewProductModal?: () => void;
}

export function Header({ onOpenNewProductModal }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por SKU, nome de produto ou categoria..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-secondary/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-primary absolute top-1.5 right-1.5 ring-2 ring-card" />
        </button>

        <div className="h-4 w-px bg-border my-auto" />

        {/* Action Button: Novo Produto */}
        {onOpenNewProductModal ? (
          <button
            onClick={onOpenNewProductModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-primary-foreground font-bold" />
            <span>Novo Produto</span>
          </button>
        ) : (
          <Link
            href="/products?action=new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-primary-foreground font-bold" />
            <span>Novo Produto</span>
          </Link>
        )}

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 text-black flex items-center justify-center font-bold text-xs shadow">
            AT
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-foreground leading-tight">Diretoria ATEEL</p>
            <p className="text-[10px] text-primary font-semibold flex items-center gap-1">
              <UserCheck className="w-3 h-3 inline text-primary" /> Admin Hub
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
