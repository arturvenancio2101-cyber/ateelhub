'use client';

import React, { useState, useEffect } from 'react';
import { Kit, Product } from '@/types/plm';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Package, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  X,
  PlusCircle,
  Tag,
  Gift,
  HelpCircle,
  Info,
  Check
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SelectedItemInput {
  productId: string;
  quantity: number;
}

export default function KitsPage() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [memberPrice, setMemberPrice] = useState<number>(0);
  const [nonMemberPrice, setNonMemberPrice] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<SelectedItemInput[]>([]);

  // Item builder states
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);

  const fetchKits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kits');
      const json = await res.json();
      if (json.success) setKits(json.data);
    } catch (err) {
      console.error('Erro ao buscar kits:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        if (json.data.length > 0) {
          setCurrentProductId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  };

  useEffect(() => {
    fetchKits();
    fetchProducts();
  }, []);

  const handleAddItem = () => {
    if (!currentProductId || currentQuantity < 1) return;
    
    // Check if product is already added
    const existing = selectedItems.find(item => item.productId === currentProductId);
    if (existing) {
      setSelectedItems(prev => prev.map(item => 
        item.productId === currentProductId 
          ? { ...item, quantity: item.quantity + currentQuantity }
          : item
      ));
    } else {
      setSelectedItems(prev => [...prev, { productId: currentProductId, quantity: currentQuantity }]);
    }
    setCurrentQuantity(1);
  };

  const handleRemoveItem = (prodId: string) => {
    setSelectedItems(prev => prev.filter(item => item.productId !== prodId));
  };

  // Calculations for the new kit form
  const getSelectedItemsCalculations = () => {
    let totalCost = 0;
    let totalAvulsoMember = 0;
    let totalAvulsoNonMember = 0;

    selectedItems.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        totalCost += (prod.costPrice || 0) * item.quantity;
        totalAvulsoMember += (prod.memberPrice || 0) * item.quantity;
        totalAvulsoNonMember += (prod.nonMemberPrice || 0) * item.quantity;
      }
    });

    const discMember = totalAvulsoMember > 0 ? totalAvulsoMember - memberPrice : 0;
    const discNonMember = totalAvulsoNonMember > 0 ? totalAvulsoNonMember - nonMemberPrice : 0;

    const discMemberPercent = totalAvulsoMember > 0 ? (discMember / totalAvulsoMember) * 100 : 0;
    const discNonMemberPercent = totalAvulsoNonMember > 0 ? (discNonMember / totalAvulsoNonMember) * 100 : 0;

    const profitMember = memberPrice - totalCost;
    const profitNonMember = nonMemberPrice - totalCost;

    const marginMember = memberPrice > 0 ? (profitMember / memberPrice) * 100 : 0;
    const marginNonMember = nonMemberPrice > 0 ? (profitNonMember / nonMemberPrice) * 100 : 0;

    return {
      totalCost,
      totalAvulsoMember,
      totalAvulsoNonMember,
      discMember,
      discNonMember,
      discMemberPercent,
      discNonMemberPercent,
      profitMember,
      profitNonMember,
      marginMember,
      marginNonMember
    };
  };

  const calcs = getSelectedItemsCalculations();

  const handleCreateKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedItems.length === 0 || memberPrice <= 0 || nonMemberPrice <= 0) {
      alert('Preencha os campos obrigatórios e adicione ao menos 1 item.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          imageUrl: imageUrl || undefined,
          memberPrice: parseFloat(memberPrice.toString()),
          nonMemberPrice: parseFloat(nonMemberPrice.toString()),
          items: selectedItems
        })
      });
      const json = await res.json();
      if (json.success) {
        setName('');
        setDescription('');
        setImageUrl('');
        setMemberPrice(0);
        setNonMemberPrice(0);
        setSelectedItems([]);
        setIsModalOpen(false);
        fetchKits();
      } else {
        alert('Erro ao criar kit: ' + json.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKit = async (id: string, kitName: string) => {
    if (!confirm(`Remover combo "${kitName}" permanentemente do ATEEL Products Hub?`)) return;
    try {
      const res = await fetch(`/api/kits/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchKits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper calculations for existing kits
  const getKitCalculations = (kit: Kit) => {
    let totalCost = 0;
    let totalAvulsoMember = 0;
    let totalAvulsoNonMember = 0;

    (kit.items || []).forEach(item => {
      // item.product could be populated by backend, fallback to search in state if needed
      const prod = item.product || products.find(p => p.id === item.productId);
      if (prod) {
        totalCost += (prod.costPrice || 0) * item.quantity;
        totalAvulsoMember += (prod.memberPrice || 0) * item.quantity;
        totalAvulsoNonMember += (prod.nonMemberPrice || 0) * item.quantity;
      }
    });

    const profitMember = kit.memberPrice - totalCost;
    const profitNonMember = kit.nonMemberPrice - totalCost;
    
    const discountMember = totalAvulsoMember - kit.memberPrice;
    const discountNonMember = totalAvulsoNonMember - kit.nonMemberPrice;

    return {
      totalCost,
      totalAvulsoMember,
      totalAvulsoNonMember,
      profitMember,
      profitNonMember,
      discountMember,
      discountNonMember
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Gestão de Kits & Combos Promocionais
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Agrupe múltiplos produtos em pacotes promocionais e projete lucros consolidados de sócio/não-sócio
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow"
        >
          <Plus className="w-4 h-4 text-primary-foreground font-bold" />
          <span>Novo Combo / Kit</span>
        </button>
      </div>

      {/* Grid of Kits */}
      {loading ? (
        <div className="text-center p-12 text-xs text-indigo-400 font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Carregando combos...
        </div>
      ) : kits.length === 0 ? (
        <div className="text-center p-12 text-xs text-muted-foreground italic border border-dashed border-border rounded-xl bg-card">
          Nenhum kit promocional cadastrado. Clique em Novo Combo para iniciar!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kits.map((kit) => {
            const kCalcs = getKitCalculations(kit);
            return (
              <div 
                key={kit.id}
                className="rounded-xl border border-border bg-card shadow hover:border-primary/45 transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Image & Main Info */}
                <div>
                  <div className="h-40 w-full relative bg-secondary overflow-hidden flex items-center justify-center border-b border-border/60">
                    {kit.imageUrl ? (
                      <img 
                        src={kit.imageUrl} 
                        alt={kit.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground" />
                    )}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-primary flex items-center gap-1 border border-primary/20">
                      <Gift className="w-3 h-3 text-primary" /> Combo
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-foreground leading-snug">{kit.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {kit.description || 'Sem descrição cadastrada.'}
                      </p>
                    </div>

                    {/* Composition Breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-border/40">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Itens inclusos:</span>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {(kit.items || []).map((item) => {
                          const prod = item.product || products.find(p => p.id === item.productId);
                          return (
                            <div key={item.id} className="flex items-center justify-between text-[11px] bg-secondary/30 px-2 py-1 rounded border border-border/40">
                              <span className="font-medium text-white truncate max-w-[180px]">{prod ? prod.name : 'Produto'}</span>
                              <span className="font-bold font-mono text-primary text-[10px] bg-primary/10 px-1 rounded">x{item.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border/40 bg-zinc-900/10 p-2 rounded-lg">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-zinc-400 font-bold block">Preço Sócio</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">{formatCurrency(kit.memberPrice)}</span>
                        {kCalcs.discountMember > 0 && (
                          <span className="text-[9px] text-emerald-500 font-bold block">
                            (Desconto: {formatCurrency(kCalcs.discountMember)})
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-zinc-400 font-bold block">Preço Não-Sócio</span>
                        <span className="text-xs font-bold text-yellow-400 font-mono">{formatCurrency(kit.nonMemberPrice)}</span>
                        {kCalcs.discountNonMember > 0 && (
                          <span className="text-[9px] text-amber-500 font-bold block">
                            (Desconto: {formatCurrency(kCalcs.discountNonMember)})
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 pt-1 border-t border-border/30 flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground font-semibold">Custo de produção:</span>
                        <span className="font-mono text-zinc-300 font-bold">{formatCurrency(kCalcs.totalCost)}</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between text-[10px] text-emerald-400">
                        <span className="font-bold">Lucro Médio (Sócio):</span>
                        <span className="font-mono font-bold">+{formatCurrency(kCalcs.profitMember)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-4 py-3 border-t border-border/60 bg-secondary/20 flex justify-end">
                  <button
                    onClick={() => handleDeleteKit(kit.id, kit.name)}
                    className="p-1.5 rounded-lg border border-border bg-secondary hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-all"
                    title="Excluir kit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE KIT FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs text-foreground max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">Criar Novo Combo / Kit ATEEL</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Kit Name */}
                <div>
                  <label className="block font-semibold mb-1">Nome do Kit / Combo *</label>
                  <input
                    type="text"
                    placeholder="ex: Kit Calouro Classic"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-medium"
                    required
                  />
                </div>

                {/* Kit Image */}
                <div>
                  <label className="block font-semibold mb-1">URL da Imagem de Capa</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold mb-1">Descrição Comercial do Kit</label>
                <textarea
                  rows={2}
                  placeholder="Descreva o que vem no kit e as vantagens de adquirir o combo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Composition Selection */}
              <div className="p-3.5 rounded-lg border border-border bg-secondary/15 space-y-3">
                <h4 className="font-bold text-[11px] text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>Montar Grade do Combo</span>
                </h4>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Selecione o Produto Avulso</label>
                    <select
                      value={currentProductId}
                      onChange={(e) => setCurrentProductId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-medium"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Sócio: {formatCurrency(p.memberPrice)} | Cost: {formatCurrency(p.costPrice)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Quantidade</label>
                    <input
                      type="number"
                      min={1}
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-bold text-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shrink-0 shadow h-[38px]"
                  >
                    <PlusCircle className="w-4 h-4 text-primary-foreground" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Selected Items List */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-muted-foreground block">Itens incluídos no Kit:</span>
                  {selectedItems.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic text-center py-2">Nenhum produto adicionado ao combo ainda.</p>
                  ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {selectedItems.map((item) => {
                        const p = products.find(prod => prod.id === item.productId);
                        if (!p) return null;
                        return (
                          <div key={item.productId} className="flex items-center justify-between bg-zinc-900 border border-border/60 rounded px-2.5 py-1 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white">{p.name}</span>
                              <span className="text-[10px] text-zinc-400">({formatCurrency(p.memberPrice)} un)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-primary">Qtd: {item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.productId)}
                                className="p-0.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Set & Financial Projections */}
              {selectedItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/40 pt-4">
                  {/* Prices Setting */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-[11px] text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Preço Final do Kit</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Preço Kit para Sócio (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={memberPrice || ''}
                          onChange={(e) => setMemberPrice(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-bold font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Preço Kit não Sócio (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={nonMemberPrice || ''}
                          onChange={(e) => setNonMemberPrice(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-bold font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Projections Visual Panel */}
                  <div className="p-3 bg-zinc-900 border border-primary/10 rounded-lg text-[11px] space-y-2">
                    <h5 className="font-bold text-primary flex items-center gap-1 text-[10px] uppercase tracking-wider">
                      <TrendingUp className="w-3 h-3 text-primary animate-pulse" />
                      Análise Financeira
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-y-1.5 text-zinc-300">
                      <div>Soma Avulsa (Sócios):</div>
                      <div className="text-right font-mono font-semibold">{formatCurrency(calcs.totalAvulsoMember)}</div>

                      <div>Preço Definido (Kit):</div>
                      <div className="text-right font-mono font-semibold text-emerald-400">{formatCurrency(memberPrice)}</div>

                      <div className="text-emerald-500 font-semibold">Desconto Promocional:</div>
                      <div className="text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(calcs.discMember)} ({calcs.discMemberPercent.toFixed(1)}%)
                      </div>

                      <div className="border-t border-border/30 col-span-2 my-1"></div>

                      <div>Custo Total de Produção:</div>
                      <div className="text-right font-mono font-semibold text-zinc-400">{formatCurrency(calcs.totalCost)}</div>

                      <div className="font-bold text-primary">Margem de Lucro (Sócio):</div>
                      <div className={`text-right font-mono font-bold ${calcs.profitMember >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(calcs.profitMember)} ({calcs.marginMember.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-secondary/30 shrink-0 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateKit}
                disabled={submitting || selectedItems.length === 0}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-primary-foreground" />
                    <span>Salvar Combo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
