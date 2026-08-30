'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/plm';
import { formatCurrency, getStatusBadgeStyle, getCategoryBadgeStyle, formatDate } from '@/lib/utils';
import { 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  ArrowUpRight, 
  Trash2,
  SlidersHorizontal,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { NewProductModal } from '@/components/products/NewProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o produto "${name}" do portfólio da ATEEL?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 text-xs">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Catálogo Geral de Produtos ATEEL
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gerenciamento centralizado de mockups, tecidos, precificação para sócios e controle de estoque
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-primary-foreground font-bold" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por SKU, nome ou confecção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">Filtros:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-medium focus:outline-none"
          >
            <option value="ALL">Todas Categorias</option>
            <option value="Camiseta">Camiseta</option>
            <option value="Samba-canção">Samba-canção</option>
            <option value="Meia">Meia</option>
            <option value="Jersey">Jersey</option>
            <option value="Caneca">Caneca</option>
            <option value="Tirante">Tirante</option>
            <option value="Moletom">Moletom</option>
            <option value="Outro">Outro</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-medium focus:outline-none"
          >
            <option value="ALL">Todos os Estágios</option>
            <option value="Briefing">Briefing da Arte</option>
            <option value="Design">Design & Mockup</option>
            <option value="Cotação">Cotação & Amostra</option>
            <option value="Pré-Venda">Pré-Venda</option>
            <option value="Em Produção">Em Produção</option>
            <option value="Estoque">Em Estoque</option>
            <option value="Encerrado">Encerrado</option>
          </select>

          <button
            onClick={fetchProducts}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border"
            title="Atualizar Tabela"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden text-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-primary font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Carregando lista de produtos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground italic">
            Nenhum produto encontrado com os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">SKU / Produto</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Fase de Confecção</th>
                  <th className="py-3 px-4">Pré-Venda / Estoque</th>
                  <th className="py-3 px-4">Preço Sócio / Não-Sócio</th>
                  <th className="py-3 px-4">Confecção / Fornecedor</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.map((product) => {
                  const statusStyle = getStatusBadgeStyle(product.status);
                  const catStyle = getCategoryBadgeStyle(product.category);

                  let preQty = 0;
                  let stockQty = 0;
                  if (product.sizes) {
                    product.sizes.forEach(sz => {
                      preQty += sz.quantityPreOrder;
                      stockQty += sz.quantityStock;
                    });
                  }

                  return (
                    <tr key={product.id} className="hover:bg-secondary/40 transition-colors group">
                      <td className="py-3.5 px-4">
                        <Link 
                          href={`/products/${product.id}`}
                          className="font-bold text-foreground hover:text-primary transition-colors block text-sm"
                        >
                          {product.name}
                        </Link>
                        <span className="text-[10px] font-mono text-muted-foreground">{product.sku}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${catStyle.bg}`}>
                          {catStyle.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {statusStyle.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                          <span>{preQty} un <span className="text-muted-foreground font-normal">/ {stockQty} un</span></span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-primary">{formatCurrency(product.memberPrice)}</div>
                        <div className="text-[10px] text-muted-foreground">{formatCurrency(product.nonMemberPrice)} (Não-sócio)</div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {product.supplierName || 'A definir'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
                            title="Ver Detalhes do Lote"
                          >
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          </Link>

                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                            title="Remover Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
