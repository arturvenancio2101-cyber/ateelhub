'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, ProductSize } from '@/types/plm';
import { 
  formatCurrency, 
  formatDate, 
  getStatusBadgeStyle, 
  getCategoryBadgeStyle
} from '@/lib/utils';
import { 
  ArrowLeft, 
  Layers, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Calendar, 
  RefreshCw,
  Trash2,
  FileText,
  ShoppingBag,
  Award,
  Tag,
  Save,
  Truck,
  Percent
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sizes' | 'financial' | 'supplier'>('overview');

  // Edit fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [printTechnique, setPrintTechnique] = useState('');
  
  // Size grid state
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  
  // Financial state
  const [costPrice, setCostPrice] = useState<number>(0);
  const [memberPrice, setMemberPrice] = useState<number>(0);
  const [nonMemberPrice, setNonMemberPrice] = useState<number>(0);

  // Supplier state
  const [supplierName, setSupplierName] = useState('');
  const [supplierLeadTime, setSupplierLeadTime] = useState<number>(15);
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('');

  const [saving, setSaving] = useState(false);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      const json = await res.json();
      if (json.success) {
        const prod = json.data as Product;
        setProduct(prod);
        setName(prod.name);
        setDescription(prod.description || '');
        setCoverImageUrl(prod.coverImageUrl || '');
        setStatus(prod.status);
        setFabricType(prod.fabricType || 'Algodão Penteado');
        setPrintTechnique(prod.printTechnique || 'Serigrafia');
        setSizes(prod.sizes || []);
        setCostPrice(prod.costPrice);
        setMemberPrice(prod.memberPrice);
        setNonMemberPrice(prod.nonMemberPrice);
        setSupplierName(prod.supplierName || '');
        setSupplierLeadTime(prod.supplierLeadTimeDays || 15);
        setTargetDeliveryDate(prod.targetDeliveryDate ? prod.targetDeliveryDate.split('T')[0] : '');
      } else {
        console.error('Produto não encontrado:', json.error);
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes do produto:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchProductDetails();
  }, [productId]);

  const handleUpdateProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          coverImageUrl,
          status,
          fabricType,
          printTechnique,
          costPrice,
          memberPrice,
          nonMemberPrice,
          supplierName,
          supplierLeadTime,
          targetDeliveryDate: targetDeliveryDate ? new Date(targetDeliveryDate).toISOString() : null
        })
      });
      const json = await res.json();
      if (json.success) {
        alert('Lote de produto atualizado com sucesso!');
        fetchProductDetails();
      }
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSizes = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizes })
      });
      const json = await res.json();
      if (json.success) {
        alert('Grade de tamanhos atualizada com sucesso!');
        fetchProductDetails();
      }
    } catch (err) {
      console.error('Erro ao salvar grade:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSizeChange = (index: number, field: 'quantityPreOrder' | 'quantityStock', value: number) => {
    const updated = [...sizes];
    updated[index] = { ...updated[index], [field]: value };
    setSizes(updated);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary font-medium text-xs">
          <RefreshCw className="w-5 h-5 animate-spin" /> Carregando detalhes do produto ATEEL...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center space-y-4 text-xs">
        <p className="text-muted-foreground">Produto não encontrado ou removido.</p>
        <button
          onClick={() => router.push('/products')}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const catStyle = getCategoryBadgeStyle(product.category);
  const statusStyle = getStatusBadgeStyle(status);

  // Financial aggregates
  const totalPreOrders = sizes.reduce((acc, sz) => acc + sz.quantityPreOrder, 0);
  const totalStock = sizes.reduce((acc, sz) => acc + sz.quantityStock, 0);
  const totalQuantity = totalPreOrders + totalStock;

  const totalCost = costPrice * totalQuantity;
  // Estimate revenue based on member/non-member sales distribution (usually 85% members, 15% non-members)
  const estRevenue = (memberPrice * 0.85 + nonMemberPrice * 0.15) * totalQuantity;
  const netProfit = estRevenue - totalCost;
  const marginPercentage = estRevenue > 0 ? (netProfit / estRevenue) * 100 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-xs">
      {/* Top Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo de Produtos
        </Link>
        <span className="text-[10px] text-muted-foreground font-mono">SKU: {product.sku}</span>
      </div>

      {/* Product Hero Header */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${catStyle.bg}`}>
                {catStyle.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {statusStyle.label}
              </span>
              <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-xl font-bold text-foreground">{product.name}</h1>
            <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
              {product.description || 'Nenhuma especificação cadastrada.'}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/60 border border-border/80 shrink-0">
            <div className="px-3 border-r border-border">
              <span className="text-[9px] text-muted-foreground font-semibold uppercase block">Total de Peças</span>
              <span className="text-sm font-bold font-mono text-primary">{totalQuantity} un</span>
            </div>
            <div className="px-3 border-r border-border">
              <span className="text-[9px] text-muted-foreground font-semibold uppercase block">Faturamento Est.</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{formatCurrency(estRevenue)}</span>
            </div>
            <div className="px-3">
              <span className="text-[9px] text-muted-foreground font-semibold uppercase block">Confecção</span>
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1 mt-0.5">
                <Truck className="w-3.5 h-3.5 text-primary" /> {supplierName || 'A definir'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-2 space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Estágio de Confecção</span>
            <span className="text-primary">{status}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300" 
              style={{ width: 
                status === 'Briefing' ? '15%' :
                status === 'Design' ? '30%' :
                status === 'Cotação' ? '45%' :
                status === 'Pré-Venda' ? '60%' :
                status === 'Em Produção' ? '80%' :
                status === 'Estoque' ? '100%' : '10%'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" /> 1. Ficha Técnica & Mockup
        </button>

        <button
          onClick={() => setActiveTab('sizes')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'sizes'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> 2. Grade de Tamanhos & Estoque
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'financial'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <DollarSign className="w-4 h-4" /> 3. Custos & Precificação Financeira
        </button>

        <button
          onClick={() => setActiveTab('supplier')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'supplier'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Truck className="w-4 h-4" /> 4. Fornecedor & Confecção
        </button>
      </div>

      {/* Tab 1: Ficha Técnica & Mockup */}
      {activeTab === 'overview' && (
        <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Especificações */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Ficha de Especificações do Produto
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400">Nome do Produto</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400">Estágio Atual</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-medium"
                  >
                    <option value="Briefing">Briefing da Arte</option>
                    <option value="Design">Design & Mockup</option>
                    <option value="Cotação">Cotação & Amostra</option>
                    <option value="Pré-Venda">Pré-Venda</option>
                    <option value="Em Produção">Em Produção</option>
                    <option value="Estoque">Em Estoque</option>
                    <option value="Encerrado">Encerrado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400">Tipo de Tecido / Material</label>
                  <input
                    type="text"
                    value={fabricType}
                    onChange={(e) => setFabricType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400">Técnica de Estampa / Acabamento</label>
                  <input
                    type="text"
                    value={printTechnique}
                    onChange={(e) => setPrintTechnique(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-400">Observações de Confecção & Descrição</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Galeria / Mockup */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground">Visual do Produto (Mockup)</h3>
              
              <div className="h-64 w-full rounded-lg bg-secondary overflow-hidden flex items-center justify-center border border-border">
                {coverImageUrl ? (
                  <img src={coverImageUrl} alt="Mockup" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground italic text-center px-4">Nenhuma imagem de mockup cadastrada</span>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-400">URL da Imagem / Mockup</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow-sm"
                >
                  Atualizar Imagem
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Grade de Tamanhos & Estoque */}
      {activeTab === 'sizes' && (
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Grade de Tamanhos & Quantidades (Lista de Corte)</h3>
              <p className="text-[11px] text-muted-foreground">Registre pedidos da pré-venda e estoque a pronta entrega para confecção</p>
            </div>
            <button
              onClick={handleUpdateSizes}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Gravando...' : 'Salvar Alterações da Grade'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Tamanho</th>
                  <th className="py-2.5 px-4">Pré-Venda (Pedidos do Site / Planilha)</th>
                  <th className="py-2.5 px-4">Estoque (Pronta Entrega Física)</th>
                  <th className="py-2.5 px-4 font-mono">Somatório Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sizes.map((sz, idx) => (
                  <tr key={sz.id} className="hover:bg-secondary/40 font-mono">
                    <td className="py-3 px-4 font-sans font-bold text-foreground">{sz.sizeName}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={sz.quantityPreOrder}
                        onChange={(e) => handleSizeChange(idx, 'quantityPreOrder', Number(e.target.value))}
                        className="w-28 px-3 py-1 rounded bg-secondary border border-border text-foreground font-semibold"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={sz.quantityStock}
                        onChange={(e) => handleSizeChange(idx, 'quantityStock', Number(e.target.value))}
                        className="w-28 px-3 py-1 rounded bg-secondary border border-border text-foreground font-semibold"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">
                      {sz.quantityPreOrder + sz.quantityStock} un
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Custos & Precificação Financeira */}
      {activeTab === 'financial' && (
        <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground">Configuração de Preços e Custo de Confecção</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400">Custo Confecção Unitário (R$)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400">Preço Sócio (R$)</label>
                  <input
                    type="number"
                    value={memberPrice}
                    onChange={(e) => setMemberPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400">Preço Não-Sócio (R$)</label>
                  <input
                    type="number"
                    value={nonMemberPrice}
                    onChange={(e) => setNonMemberPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Gravando...' : 'Salvar Alterações de Preço'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Resumo de Projeção Financeira do Lote */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground">Projeção Financeira do Lote</h3>
              
              <div className="space-y-3 font-mono">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-sans">Quantidade Lote:</span>
                  <span className="font-bold text-foreground">{totalQuantity} un</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-sans">Custo Confecção Total:</span>
                  <span className="font-bold text-rose-400">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-sans">Faturamento Estimado:</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(estRevenue)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-sans">Margem de Lucro:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    {formatCurrency(netProfit)}
                    <span className="text-[10px] text-muted-foreground">({marginPercentage.toFixed(1)}%)</span>
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/60 border border-border text-[10px] leading-relaxed text-muted-foreground">
                <strong>Nota:</strong> O faturamento estimado é calculado baseado em uma média histórica de vendas da diretoria da ATEEL, onde 85% das peças são vendidas a preço de Sócio e 15% a preço de Não-Sócio.
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: Fornecedor & Confecção */}
      {activeTab === 'supplier' && (
        <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Ficha Cadastral da Confecção / Fornecedor
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400">Nome da Confecção / Razão Social</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    placeholder="ex: Confecções Tigrão Sul Ltda"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400 font-mono">Lead Time de Produção (Dias)</label>
                  <input
                    type="number"
                    value={supplierLeadTime}
                    onChange={(e) => setSupplierLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-400">Previsão Acordada de Entrega</label>
                  <input
                    type="date"
                    value={targetDeliveryDate}
                    onChange={(e) => setTargetDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Gravando...' : 'Salvar Dados do Fornecedor'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Supplier Info card */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground">Controle de Cronograma</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 text-primary">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Prazo de Confecção</h4>
                    <p className="text-[10px] text-muted-foreground">Tempo médio acordado: {supplierLeadTime} dias úteis</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Previsão Limite</h4>
                    <p className="text-[10px] text-muted-foreground">Entrega prevista: {targetDeliveryDate ? formatDate(new Date(targetDeliveryDate).toISOString()) : 'Não acordada'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
