'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/plm';
import { formatCurrency, getStatusBadgeStyle } from '@/lib/utils';
import { 
  ShoppingBag, 
  Search, 
  Download, 
  Edit3, 
  Box, 
  RefreshCw,
  TrendingUp,
  Tag,
  CheckCircle,
  X
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CatalogPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Price Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editMemberPrice, setEditMemberPrice] = useState(0);
  const [editNonMemberPrice, setEditNonMemberPrice] = useState(0);
  const [editCostPrice, setEditCostPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        // Show all products except 'Encerrado' or show all? 
        // Let's show all, but we can filter client side.
        setProducts(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleExportCSV = () => {
    const headers = ['SKU', 'Produto', 'Categoria', 'Preço Oficial', 'Preço Sócio', 'Estágio'];
    if (isAdmin) {
      headers.push('Custo de Fabricação', 'Lucro Bruto (Não-Sócio)', 'Margem (%)');
    }

    const rows = filteredProducts.map(p => {
      const row = [
        p.sku,
        p.name,
        p.category,
        p.nonMemberPrice.toString(),
        p.memberPrice.toString(),
        p.status
      ];
      
      if (isAdmin) {
        const profit = p.nonMemberPrice - p.costPrice;
        const margin = p.nonMemberPrice > 0 ? (profit / p.nonMemberPrice) * 100 : 0;
        row.push(p.costPrice.toString(), profit.toString(), margin.toFixed(2));
      }
      return row;
    });

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Tabela_Precos_ATEEL.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEdit = (product: Product) => {
    if (!isAdmin) return;
    setEditingProduct(product);
    setEditMemberPrice(product.memberPrice);
    setEditNonMemberPrice(product.nonMemberPrice);
    setEditCostPrice(product.costPrice);
    setIsEditModalOpen(true);
  };

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberPrice: editMemberPrice,
          nonMemberPrice: editNonMemberPrice,
          costPrice: editCostPrice
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        alert(json.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Catálogo & Tabela de Preços
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vitrine oficial de produtos ativos, precificação de vendas e margens de lucro.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs font-bold hover:bg-secondary/80 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Exportar Tabela
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3 bg-secondary/50 border border-border text-foreground text-xs rounded-lg flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" /> Você está visualizando o catálogo como <strong>Visitante/Membro</strong>. Edição de preços e custos são restritos à Diretoria.
        </div>
      )}

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nome, SKU ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-secondary border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="text-center p-12 text-xs text-primary font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Carregando vitrine...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center p-12 text-xs text-muted-foreground italic border border-dashed border-border rounded-xl bg-card">
          Nenhum produto encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const statusStyle = getStatusBadgeStyle(product.status);
            
            // Availability Status logic
            let availability = 'Ativo';
            let availColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            
            if (['Briefing', 'Design', 'Cotação'].includes(product.status)) {
              availability = 'Em Breve';
              availColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            } else if (product.status === 'Pré-Venda') {
              availability = 'Em Pré-Venda';
              availColor = 'text-primary bg-primary/10 border-primary/20';
            } else if (product.status === 'Encerrado') {
              availability = 'Esgotado';
              availColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            }

            const profit = product.nonMemberPrice - product.costPrice;
            const margin = product.nonMemberPrice > 0 ? (profit / product.nonMemberPrice) * 100 : 0;
            const sizesAvailable = product.sizes && product.sizes.length > 0 
              ? product.sizes.map(s => s.sizeName).join(', ') 
              : 'Tamanho Único';

            return (
              <div key={product.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col hover:border-primary/40 transition-all">
                {/* Thumbnail */}
                <div className="h-48 w-full relative bg-secondary overflow-hidden flex items-center justify-center border-b border-border/60 group">
                  {product.coverImageUrl ? (
                    <img 
                      src={product.coverImageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Box className="w-12 h-12 text-muted-foreground" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-sm ${availColor}`}>
                      {availability}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      Fase: {product.status}
                    </span>
                    <span className="text-[10px] font-mono bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
                      {product.sku}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-sm mb-1 leading-tight">{product.name}</h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                    {product.description || `Produto da categoria ${product.category}.`}
                  </p>

                  <div className="mt-auto space-y-4">
                    {/* Variations */}
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="uppercase font-bold tracking-wider">Tamanhos:</span>
                      <span className="truncate">{sizesAvailable}</span>
                    </div>

                    {/* Pricing */}
                    <div className="p-3 bg-secondary/30 rounded-lg border border-border/60">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">Preço Oficial</span>
                          <span className="text-xl font-bold font-mono text-foreground">{formatCurrency(product.nonMemberPrice)}</span>
                        </div>
                        {product.memberPrice > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-primary block mb-0.5">Sócio ATEEL</span>
                            <span className="text-sm font-bold font-mono text-primary">{formatCurrency(product.memberPrice)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Financials */}
                    {isAdmin && (
                      <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground font-semibold">Custo de Fab. Unitário:</span>
                          <span className="font-mono text-foreground">{formatCurrency(product.costPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-400" /> Lucro / Margem:
                          </span>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatCurrency(profit)} ({margin.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="px-4 py-3 border-t border-border bg-secondary/20 flex justify-end">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background border border-border hover:border-primary hover:text-primary transition-all text-[11px] font-bold shadow-sm"
                    >
                      <Edit3 className="w-3 h-3" /> Editar Preços
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Pricing Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Editar Preços
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSavePrices} className="p-4 space-y-4 text-xs">
              <div>
                <p className="font-bold text-foreground mb-1">{editingProduct.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono mb-4">SKU: {editingProduct.sku}</p>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Custo de Fabricação (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editCostPrice || ''}
                  onChange={(e) => setEditCostPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground font-mono focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Preço Sócio (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editMemberPrice || ''}
                    onChange={(e) => setEditMemberPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Preço Oficial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editNonMemberPrice || ''}
                    onChange={(e) => setEditNonMemberPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded bg-secondary text-foreground hover:bg-secondary/80 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-1"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
