'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/plm';
import { getCategoryBadgeStyle, formatCurrency, formatDate } from '@/lib/utils';
import { 
  Kanban as KanbanIcon, 
  Filter, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  RefreshCw,
  ArrowUpRight,
  ImageIcon,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

const STAGES = [
  { id: 'Briefing', label: '1. Briefing da Arte', color: 'border-zinc-800 bg-zinc-950/20' },
  { id: 'Design', label: '2. Design & Mockup', color: 'border-blue-500/20 bg-blue-500/5' },
  { id: 'Cotação', label: '3. Cotação & Amostra', color: 'border-purple-500/20 bg-purple-500/5' },
  { id: 'Pré-Venda', label: '4. Pré-Venda', color: 'border-primary/20 bg-primary/5' },
  { id: 'Em Produção', label: '5. Em Produção', color: 'border-amber-500/20 bg-amber-500/5' },
  { id: 'Estoque', label: '6. Em Estoque', color: 'border-emerald-500/20 bg-emerald-500/5' },
  { id: 'Encerrado', label: '7. Encerrado', color: 'border-rose-500/20 bg-rose-500/5' }
];

export default function PipelinePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleMoveStatus = async (productId: string, newStatus: string) => {
    // Atualização otimista na UI
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p));
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Erro ao mover estágio:', err);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Pipeline Header Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <KanbanIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Pipeline de Lançamento (Stage-Gate de Confecção)</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fluxo produtivo dos lotes da ATEEL: do briefing com o designer até a entrega física e vendas
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filtrar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-secondary/80 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1 bg-secondary/80 p-1 rounded-lg border border-border">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mx-1.5 shrink-0" />
            {['ALL', 'Camiseta', 'Samba-canção', 'Meia', 'Jersey', 'Caneca', 'Tirante', 'Moletom'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat === 'ALL' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          <button
            onClick={fetchProducts}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border"
            title="Recarregar Pipeline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" /> Carregando quadro Kanban da Confecção...
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1700px] h-full items-start">
            {STAGES.map((stage, stageIdx) => {
              const stageProducts = filteredProducts.filter(p => p.status === stage.id);
              return (
                <div 
                  key={stage.id}
                  className={`w-72 rounded-xl border border-border/80 p-3 flex flex-col max-h-full ${stage.color} shrink-0`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/40">
                    <span className="text-xs font-bold text-foreground tracking-wide">{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-border text-foreground text-[10px] font-mono font-bold">
                      {stageProducts.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[400px]">
                    {stageProducts.length === 0 ? (
                      <div className="h-28 flex items-center justify-center text-[10px] text-zinc-500 italic border border-dashed border-zinc-800 rounded-lg">
                        Nenhum lote nesta fase
                      </div>
                    ) : (
                      stageProducts.map((product) => {
                        const catStyle = getCategoryBadgeStyle(product.category);
                        
                        // Soma total de pré-vendas e estoque físico
                        let preQty = 0;
                        let stockQty = 0;
                        if (product.sizes) {
                          product.sizes.forEach(s => {
                            preQty += s.quantityPreOrder;
                            stockQty += s.quantityStock;
                          });
                        }

                        return (
                          <div
                            key={product.id}
                            className="p-3 rounded-lg bg-card border border-border/80 shadow-sm hover:shadow hover:border-primary/40 transition-all space-y-3 group text-xs"
                          >
                            {/* Mockup Preview Cover */}
                            {product.coverImageUrl && (
                              <div className="w-full h-28 rounded-md overflow-hidden bg-secondary border border-border/40 relative">
                                <img 
                                  src={product.coverImageUrl} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-primary">
                                  {product.sku}
                                </span>
                              </div>
                            )}

                            {/* Card Header: Category & Code */}
                            {!product.coverImageUrl && (
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${catStyle.bg}`}>
                                  {catStyle.label}
                                </span>
                                <span className="text-[10px] font-mono font-medium text-muted-foreground">{product.sku}</span>
                              </div>
                            )}

                            {/* Title & Description */}
                            <div>
                              <Link 
                                href={`/products/${product.id}`}
                                className="font-bold text-xs text-foreground group-hover:text-primary transition-colors flex items-center justify-between"
                              >
                                <span>{product.name}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                              </Link>
                              {product.description && (
                                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-normal">
                                  {product.description}
                                </p>
                              )}
                            </div>

                            {/* Quantidade Total em Pré-venda e Estoque */}
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/60 text-foreground text-[10px] font-semibold">
                              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                              <span>Pré-venda: <strong className="text-primary">{preQty} un</strong></span>
                              <span className="text-muted-foreground">| Estoque: {stockQty} un</span>
                            </div>

                            {/* Preços e Prazos */}
                            <div className="space-y-1.5 pt-2 border-t border-border/40 text-[10px]">
                              <div className="flex justify-between text-muted-foreground">
                                <span>Preço Sócio:</span>
                                <span className="font-mono text-primary font-bold">{formatCurrency(product.memberPrice)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Custo unitário:</span>
                                <span className="font-mono text-foreground font-semibold">{formatCurrency(product.costPrice)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Previsão de Entrega:</span>
                                <span className="text-foreground">{formatDate(product.targetDeliveryDate)}</span>
                              </div>
                            </div>

                            {/* Move Stage Quick Action Buttons */}
                            <div className="flex items-center justify-between pt-2 border-t border-border/40">
                              <button
                                disabled={stageIdx === 0}
                                onClick={() => handleMoveStatus(product.id, STAGES[stageIdx - 1].id)}
                                className="p-1 rounded hover:bg-secondary disabled:opacity-30 text-muted-foreground hover:text-foreground transition-colors"
                                title="Recuar fase"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>

                              <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">
                                {product.supplierName || 'Sem Fornecedor'}
                              </span>

                              <button
                                disabled={stageIdx === STAGES.length - 1}
                                onClick={() => handleMoveStatus(product.id, STAGES[stageIdx + 1].id)}
                                className="p-1 rounded hover:bg-secondary disabled:opacity-30 text-muted-foreground hover:text-foreground transition-colors"
                                title="Avançar fase"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
