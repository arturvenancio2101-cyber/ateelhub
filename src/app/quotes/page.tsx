'use client';

import React, { useState, useEffect } from 'react';
import { Product, SupplierQuote } from '@/types/plm';
import { formatCurrency, getStatusBadgeStyle } from '@/lib/utils';
import { 
  Building, 
  Plus, 
  Trophy, 
  Trash2, 
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Box,
  Truck,
  DollarSign
} from 'lucide-react';
import { useSession } from 'next-auth/react'; // Assuming NextAuth for role

export default function QuotesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New Quote Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  
  // New Quote Form
  const [supplierName, setSupplierName] = useState('');
  const [contact, setContact] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [moq, setMoq] = useState<number>(50);
  const [sampleCost, setSampleCost] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(15);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        // Only show products in early stages (Briefing, Design, Cotação)
        const active = json.data.filter((p: Product) => 
          ['Briefing', 'Design', 'Cotação'].includes(p.status)
        );
        setProducts(active);
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

  const handleOpenQuoteModal = (productId: string) => {
    setSelectedProductId(productId);
    setSupplierName('');
    setContact('');
    setUnitPrice(0);
    setMoq(50);
    setSampleCost(0);
    setShippingCost(0);
    setLeadTimeDays(15);
    setQualityRating(5);
    setNotes('');
    setIsQuoteModalOpen(true);
  };

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Apenas administradores podem adicionar cotações.');
      return;
    }
    if (!supplierName || unitPrice <= 0) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName,
          contact,
          unitPrice,
          moq,
          sampleCost,
          shippingCost,
          leadTimeDays,
          qualityRating,
          notes
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsQuoteModalOpen(false);
        fetchProducts();
      } else {
        alert(json.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectWinner = async (productId: string, quoteId: string, supplierName: string) => {
    if (!isAdmin) {
      alert('Apenas administradores podem selecionar o fornecedor vencedor.');
      return;
    }
    if (!confirm(`Declarar ${supplierName} como vencedor e atualizar o custo base do produto?`)) return;

    try {
      const res = await fetch(`/api/products/${productId}/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select_winner' })
      });
      const json = await res.json();
      if (json.success) {
        fetchProducts();
      } else {
        alert(json.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuote = async (productId: string, quoteId: string) => {
    if (!isAdmin) {
      alert('Apenas administradores podem remover cotações.');
      return;
    }
    if (!confirm('Remover esta cotação?')) return;

    try {
      await fetch(`/api/products/${productId}/quotes/${quoteId}`, {
        method: 'DELETE'
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const getTargetAmount = (p: Product) => {
    let preOrder = 0;
    if (p.sizes) {
      p.sizes.forEach(s => { preOrder += s.quantityPreOrder });
    }
    // Estimate target based on pre-orders + stock minimums. Or just use MOQ if pre-orders are less.
    return preOrder > 0 ? preOrder : 50; 
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" />
            Cotação de Fornecedores & Produção
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analise e compare propostas de confecção para os produtos em desenvolvimento.
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border"
          title="Atualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {!isAdmin && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg font-semibold flex items-center gap-2">
          Apenas usuários ADMIN podem adicionar cotações e selecionar vencedores. Suas permissões atuais são de visualização.
        </div>
      )}

      {loading ? (
        <div className="text-center p-12 text-xs text-primary font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Carregando projetos em cotação...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center p-12 text-xs text-muted-foreground italic border border-dashed border-border rounded-xl bg-card">
          Nenhum projeto em fase de cotação ou design encontrado.
        </div>
      ) : (
        <div className="space-y-8">
          {products.map((product) => {
            const statusStyle = getStatusBadgeStyle(product.status);
            const targetAmount = getTargetAmount(product);
            const quotes = product.supplierQuotes || [];

            return (
              <div key={product.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Product Header */}
                <div className="p-4 bg-secondary/30 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden shrink-0 border border-border/50">
                      {product.coverImageUrl ? (
                        <img src={product.coverImageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Box className="w-6 h-6 m-auto mt-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {statusStyle.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono bg-background px-1.5 py-0.5 rounded">
                          {product.sku}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-foreground">{product.name}</h2>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Tecido/Estampa: {product.fabricType} / {product.printTechnique}</p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenQuoteModal(product.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Cotação
                    </button>
                  )}
                </div>

                {/* Quotes Comparison Table */}
                <div className="p-4">
                  {quotes.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground text-center py-4 italic">Nenhuma cotação registrada ainda para este projeto.</p>
                  ) : (
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-4 min-w-max">
                        {quotes.map(q => {
                          const totalBaseCost = q.unitPrice + (q.shippingCost / q.moq) + (q.sampleCost / q.moq);
                          const totalProjected = totalBaseCost * Math.max(targetAmount, q.moq);

                          return (
                            <div 
                              key={q.id} 
                              className={`w-72 rounded-xl border p-4 flex flex-col justify-between transition-all relative ${
                                q.isSelected 
                                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                                  : 'border-border bg-secondary/10 hover:border-primary/30'
                              }`}
                            >
                              {q.isSelected && (
                                <div className="absolute -top-2.5 -right-2.5 bg-emerald-500 text-black px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-lg">
                                  <Trophy className="w-3 h-3" /> VENCEDOR
                                </div>
                              )}

                              <div className="space-y-4 text-[11px]">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-bold text-foreground text-sm leading-tight">{q.supplierName}</h4>
                                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[10px]">
                                      ⭐ {q.qualityRating.toFixed(1)}/5.0
                                    </p>
                                  </div>
                                  {isAdmin && !q.isSelected && (
                                    <button 
                                      onClick={() => handleDeleteQuote(product.id, q.id)}
                                      className="text-muted-foreground hover:text-red-400 p-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <div className="space-y-2 py-3 border-y border-border/60">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Preço Unitário:</span>
                                    <span className="font-mono font-bold text-emerald-400">{formatCurrency(q.unitPrice)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pedido Mínimo (MOQ):</span>
                                    <span className="font-mono font-bold">{q.moq} un</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Prazo Entrega:</span>
                                    <span className="font-mono font-bold flex items-center gap-1 text-primary">
                                      <Truck className="w-3 h-3" /> {q.leadTimeDays} dias
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-zinc-400">
                                    <span>Frete / Amostra:</span>
                                    <span className="font-mono">{formatCurrency(q.shippingCost)} / {formatCurrency(q.sampleCost)}</span>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Custo Efetivo Estimado</span>
                                  </div>
                                  <div className="p-2 rounded bg-background border border-border/60 space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-muted-foreground">Custo Unitário Final:</span>
                                      <span className="font-mono font-bold">{formatCurrency(totalBaseCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-muted-foreground">Total P/ Lote ({Math.max(targetAmount, q.moq)} un):</span>
                                      <span className="font-mono font-bold text-emerald-400">{formatCurrency(totalProjected)}</span>
                                    </div>
                                  </div>
                                </div>

                                {q.notes && (
                                  <p className="text-[10px] text-zinc-400 italic line-clamp-3">
                                    "{q.notes}"
                                  </p>
                                )}
                              </div>

                              <div className="mt-4 pt-4 border-t border-border/40">
                                {!q.isSelected && isAdmin ? (
                                  <button
                                    onClick={() => handleSelectWinner(product.id, q.id, q.supplierName)}
                                    className="w-full py-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground font-bold transition-all text-xs flex items-center justify-center gap-1.5"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" /> Escolher Fornecedor
                                  </button>
                                ) : q.isSelected ? (
                                  <div className="w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default">
                                    <Trophy className="w-4 h-4" /> Vencedor Selecionado
                                  </div>
                                ) : (
                                  <div className="w-full py-2 rounded-lg bg-secondary/50 text-muted-foreground font-semibold text-xs flex items-center justify-center">
                                    Apenas visualização
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW QUOTE MODAL */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> Registrar Nova Cotação
              </h3>
              <button onClick={() => setIsQuoteModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <Trash2 className="w-4 h-4" /> {/* Close icon visual placeholder */}
              </button>
            </div>
            <form onSubmit={handleAddQuote} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Nome do Fornecedor *</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Preço Unitário (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitPrice || ''}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">MOQ (Pedido Mínimo)</label>
                  <input
                    type="number"
                    value={moq || ''}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Frete / Entrega (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={shippingCost || ''}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Custo Amostra (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sampleCost || ''}
                    onChange={(e) => setSampleCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Prazo Entrega (Dias)</label>
                  <input
                    type="number"
                    value={leadTimeDays || ''}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Nota Qualidade (1 a 5)</label>
                  <input
                    type="number"
                    min="1" max="5" step="0.5"
                    value={qualityRating || ''}
                    onChange={(e) => setQualityRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground font-mono focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">WhatsApp / Contato</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Notas Adicionais</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalhes sobre malha, acabamento, frete..."
                  className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 rounded bg-secondary text-foreground hover:bg-secondary/80 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-1"
                >
                  {submitting ? 'Salvando...' : 'Salvar Cotação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
