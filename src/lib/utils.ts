import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: 'BRL' | 'USD' = 'BRL'): string {
  return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getStatusBadgeStyle(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'Briefing':
      return { label: 'Briefing da Arte', bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-800' };
    case 'Design':
      return { label: 'Design & Mockup', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-800' };
    case 'Cotação':
      return { label: 'Cotação & Amostra', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-800' };
    case 'Pré-Venda':
      return { label: 'Pré-Venda Aberta', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' };
    case 'Em Produção':
      return { label: 'Em Produção', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-800' };
    case 'Estoque':
      return { label: 'Em Estoque (Vendas)', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-800' };
    case 'Encerrado':
      return { label: 'Encerrado', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-800' };
    default:
      return { label: status, bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-800' };
  }
}

export function getCategoryBadgeStyle(category: string): { label: string; bg: string } {
  switch (category) {
    case 'Camiseta':
      return { label: 'Camiseta', bg: 'bg-blue-500/15 text-blue-400' };
    case 'Samba-canção':
      return { label: 'Samba-canção', bg: 'bg-cyan-500/15 text-cyan-400' };
    case 'Meia':
      return { label: 'Meia', bg: 'bg-emerald-500/15 text-emerald-400' };
    case 'Jersey':
      return { label: 'Jersey', bg: 'bg-violet-500/15 text-violet-400' };
    case 'Caneca':
      return { label: 'Caneca', bg: 'bg-amber-500/15 text-amber-400' };
    case 'Tirante':
      return { label: 'Tirante', bg: 'bg-orange-500/15 text-orange-400' };
    case 'Moletom':
      return { label: 'Moletom', bg: 'bg-pink-500/15 text-pink-400' };
    default:
      return { label: category, bg: 'bg-zinc-500/15 text-zinc-400' };
  }
}
