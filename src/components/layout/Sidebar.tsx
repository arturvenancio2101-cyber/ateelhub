'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Kanban, 
  Layers, 
  FileSpreadsheet, 
  Lightbulb, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Award,
  Truck,
  Receipt,
  Package
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard Executivo', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Central de Ideias', href: '/ideas', icon: Lightbulb },
  { name: 'Pipeline (Kanban)', href: '/pipeline', icon: Kanban },
  { name: 'Catálogo de Produtos', href: '/products', icon: Layers },
  { name: 'Kits & Combos', href: '/kits', icon: Sparkles },
  { name: 'Controle de Estoque', href: '/inventory', icon: Package },
  { name: 'Pedidos & Financeiro', href: '/orders', icon: Receipt },
  { name: 'Fornecedores & Cotações', href: '/suppliers', icon: Truck },
  { name: 'Importar / Exportar', href: '/import-export', icon: FileSpreadsheet },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-100 flex flex-col border-r border-zinc-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800/80 bg-zinc-950/40">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
          <Award className="w-5 h-5 font-bold" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
            ATEEL <span className="text-primary font-bold">HUB</span>
          </h1>
          <p className="text-[9px] text-zinc-400 font-medium tracking-wider uppercase">Produtos & Merch</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
          Módulos Principais
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary-foreground' : 'text-zinc-500 group-hover:text-primary'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary-foreground" />}
            </Link>
          );
        })}

        <div className="pt-6 px-3 mb-2 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
          Qualidade & Status
        </div>
        <div className="px-3.5 py-2 rounded-lg text-xs text-zinc-400 flex items-center justify-between bg-zinc-900/40 border border-zinc-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Controle de Lotes</span>
          </div>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">ATIVO</span>
        </div>
      </nav>

      {/* Footer System Info */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="p-3 rounded-lg bg-gradient-to-r from-zinc-900/80 to-zinc-950 border border-primary/10 text-xs">
          <div className="flex items-center gap-2 font-bold text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>Tigrão ATEEL</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-snug">
            Gestão oficial de vestuário, acessórios e merchandising da Atlética.
          </p>
        </div>
      </div>
    </aside>
  );
}
