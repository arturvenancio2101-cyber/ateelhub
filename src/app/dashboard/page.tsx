'use client';

import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Lightbulb, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  RefreshCw,
  PieChart as PieIcon,
  BarChart3,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { ExecutiveMetrics, Product } from '@/types/plm';
import { formatCurrency, getStatusBadgeStyle, getCategoryBadgeStyle } from '@/lib/utils';
import Link from 'next/link';

const COLORS = ['#FACC15', '#CA8A04', '#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMetrics, resProducts] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/products')
      ]);

      const jsonMetrics = await resMetrics.json();
      const jsonProducts = await resProducts.json();

      if (jsonMetrics.success) setMetrics(jsonMetrics.data);
      if (jsonProducts.success) setProducts(jsonProducts.data);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary font-medium">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Carregando métricas do ATEEL Products Hub...</span>
        </div>
      </div>
    );
  }

  // Prepara dados de faturamento vs custo por produto para o gráfico
  const financialChartData = products.map(p => {
    let qty = 0;
    if (p.sizes) {
      qty = p.sizes.reduce((acc, sz) => acc + sz.quantityPreOrder + sz.quantityStock, 0);
    }
    const cost = p.costPrice * qty;
    const estRevenue = (p.memberPrice * 0.85 + p.nonMemberPrice * 0.15) * qty;

    return {
      name: p.sku,
      Custo: cost,
      Faturamento: estRevenue,
    };
  }).filter(d => d.Custo > 0 || d.Faturamento > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header com Título Executivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4 text-xs">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Dashboard Executivo de Vendas & Confecção
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Monitoramento de caixa, pré-vendas, estoque físico e status do pipeline ATEEL
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all border border-border"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Métricas</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Card 1: Produtos Ativos */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Produtos em Lançamento</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">{metrics.totalActiveProducts}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              vestuário e acessórios no pipeline
            </p>
          </div>
        </div>

        {/* Card 2: Sugestões do Brainstorm */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Ideias no Brainstorm</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">{metrics.totalIdeas}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              sugestões com votações abertas
            </p>
          </div>
        </div>

        {/* Card 3: Pré-vendas totais */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Pedidos em Pré-Venda</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">{metrics.totalPreOrders} <span className="text-xs text-muted-foreground font-normal">unidades</span></div>
            <p className="text-[11px] text-muted-foreground mt-1">
              estoque físico atual: {metrics.totalStockQty} un
            </p>
          </div>
        </div>

        {/* Card 4: Faturamento Projetado */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Receita Estimada do Lote</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.totalEstimatedRevenue)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              custo total de confecção: {formatCurrency(metrics.totalCostPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos em Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Gráfico 1: Financeiro por Produto */}
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Projeção Financeira: Receita vs Custo (BRL)
            </h3>
            <p className="text-[11px] text-muted-foreground">Comparativo de faturamento bruto vs custo de confecção por lote de SKU</p>
          </div>
          <div className="h-64 w-full">
            {financialChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                Nenhum lote com quantidades cadastradas para exibir projeção financeira.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `R$${val}`} tickLine={false} />
                  <Tooltip 
                    formatter={(val: number) => [formatCurrency(val), 'Valor']} 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Faturamento" fill="#FACC15" name="Faturamento Estimado" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Custo" fill="#ef4444" name="Custo Confecção" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico 2: Distribuição por Categoria */}
        <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              Mix de Produtos ATEEL
            </h3>
            <p className="text-[11px] text-muted-foreground">Distribuição proporcional por categoria de merchandising ativo</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                >
                  {metrics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lista de Lotes Recentes */}
      <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Lotes Ativos no Pipeline de Lançamento
            </h3>
            <p className="text-[11px] text-muted-foreground">Resumo de pedidos, custos e prazos de entrega acordados</p>
          </div>
          <Link 
            href="/products" 
            className="font-bold text-primary hover:underline flex items-center gap-1"
          >
            Ver catálogo completo <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">SKU / Produto</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Fase Confecção</th>
                <th className="py-2.5 px-3">Pré-Vendas / Estoque</th>
                <th className="py-2.5 px-3">Preço Sócio</th>
                <th className="py-2.5 px-3">Fornecedor</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.map((p) => {
                const statusStyle = getStatusBadgeStyle(p.status);
                const catStyle = getCategoryBadgeStyle(p.category);
                
                let preQty = 0;
                let stockQty = 0;
                if (p.sizes) {
                  p.sizes.forEach(sz => {
                    preQty += sz.quantityPreOrder;
                    stockQty += sz.quantityStock;
                  });
                }

                return (
                  <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-foreground">{p.name}</div>
                      <span className="text-[10px] font-mono text-muted-foreground">{p.sku}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${catStyle.bg}`}>
                        {catStyle.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-foreground font-medium">
                      {preQty} un <span className="text-muted-foreground text-[10px]">/ {stockQty} un</span>
                    </td>
                    <td className="py-3 px-3 text-primary font-semibold">
                      {formatCurrency(p.memberPrice)}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {p.supplierName || 'A definir'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/products/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-semibold transition-colors border border-border"
                      >
                        Abrir Ficha <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
