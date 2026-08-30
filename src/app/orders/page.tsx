'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Order, Product, Kit } from '@/types/plm';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  X, 
  Download, 
  Upload,
  Search,
  MessageCircle,
  FileText,
  AlertTriangle,
  TrendingUp,
  Package,
  Layers,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import GoogleFormsIntegrationModal from '@/components/orders/GoogleFormsIntegrationModal';

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Delivery State
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);
  const [pickedUpBy, setPickedUpBy] = useState('');
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [moqTarget, setMoqTarget] = useState<number>(50); // Dynamic target MOQ

  // Modals state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  
  // Form states - New Order
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Item builder states
  const [isKitSelection, setIsKitSelection] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedKitId, setSelectedKitId] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resOrders, resProducts, resKits] = await Promise.all([
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/kits').then(r => r.json())
      ]);

      if (resOrders.success) setOrders(resOrders.data);
      if (resProducts.success) {
        setProducts(resProducts.data);
        if (resProducts.data.length > 0) setSelectedProductId(resProducts.data[0].id);
      }
      if (resKits.success) {
        setKits(resKits.data);
        if (resKits.data.length > 0) setSelectedKitId(resKits.data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update custom price when selected product/kit changes
  useEffect(() => {
    if (isKitSelection) {
      const kit = kits.find(k => k.id === selectedKitId);
      if (kit) setCustomPrice(kit.memberPrice); // Default to member price
    } else {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) setCustomPrice(prod.memberPrice || 0);
    }
  }, [selectedProductId, selectedKitId, isKitSelection, products, kits]);

  // Calculations for break-even
  const getOverallMetrics = () => {
    let totalOrders = orders.length;
    let totalItemsCount = 0;
    let totalProductionCost = 0;
    let totalConfirmedRevenue = 0;
    let totalProjectedRevenue = 0;

    orders.forEach(o => {
      const isConfirmed = o.paymentStatus === 'PAGO' || o.paymentStatus === 'PAGO_CONFIRMADO';
      totalProjectedRevenue += o.totalAmount;
      if (isConfirmed) {
        totalConfirmedRevenue += o.totalAmount;
      }

      (o.items || []).forEach(item => {
        totalItemsCount += item.quantity;
        
        // Find cost price
        let costPrice = 0;
        if (item.productId) {
          const prod = item.product || products.find(p => p.id === item.productId);
          if (prod) costPrice = prod.costPrice || 0;
        } else if (item.kitId) {
          const kit = item.kit || kits.find(k => k.id === item.kitId);
          if (kit) {
            // Sum costs of kit items
            (kit.items || []).forEach(ki => {
              const kProd = ki.product || products.find(p => p.id === ki.productId);
              if (kProd) costPrice += (kProd.costPrice || 0) * ki.quantity;
            });
          }
        }
        totalProductionCost += costPrice * item.quantity;
      });
    });

    const breakEvenReached = totalConfirmedRevenue >= totalProductionCost;
    const breakEvenProgress = totalProductionCost > 0 ? (totalConfirmedRevenue / totalProductionCost) * 100 : 0;
    const moqProgress = (totalItemsCount / moqTarget) * 100;

    return {
      totalOrders,
      totalItemsCount,
      totalProductionCost,
      totalConfirmedRevenue,
      totalProjectedRevenue,
      breakEvenReached,
      breakEvenProgress,
      moqProgress
    };
  };

  const metrics = getOverallMetrics();

  // Add Item to Order Form
  const handleAddItemToOrder = () => {
    if (isKitSelection) {
      const kit = kits.find(k => k.id === selectedKitId);
      if (!kit) return;
      setOrderItems(prev => [...prev, {
        kitId: kit.id,
        kit,
        size: selectedSize,
        unitPrice: customPrice,
        quantity,
        name: `Kit: ${kit.name}`
      }]);
    } else {
      const prod = products.find(p => p.id === selectedProductId);
      if (!prod) return;
      setOrderItems(prev => [...prev, {
        productId: prod.id,
        product: prod,
        size: selectedSize,
        unitPrice: customPrice,
        quantity,
        name: prod.name
      }]);
    }
    // reset item form partially
    setQuantity(1);
  };

  const handleRemoveItemFromOrder = (idx: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || orderItems.length === 0) {
      alert('Nome, WhatsApp e pelo menos 1 item são obrigatórios.');
      return;
    }

    const totalAmount = orderItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
    const payload = {
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      notes: notes || undefined,
      totalAmount,
      paymentStatus: 'PENDENTE',
      items: orderItems.map(item => ({
        productId: item.productId || null,
        kitId: item.kitId || null,
        size: item.size || null,
        unitPrice: item.unitPrice,
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setNotes('');
        setOrderItems([]);
        setShowOrderModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Validate Payment (1-Click confirmation)
  const handleValidatePayment = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'PAGO_CONFIRMADO' })
      });
      const json = await res.json();
      if (json.success) {
        loadData();
        if (selectedOrderForReceipt && selectedOrderForReceipt.id === orderId) {
          setSelectedOrderForReceipt(json.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delivery Actions
  const handleRegisterDelivery = async () => {
    if (!selectedOrderForDelivery || !pickedUpBy) return;
    try {
      const res = await fetch(`/api/orders/${selectedOrderForDelivery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryStatus: 'DELIVERED',
          deliveredById: session?.user?.id,
          pickedUpBy: pickedUpBy
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowDeliveryModal(false);
        setPickedUpBy('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetReadyForPickup = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: 'READY_FOR_PICKUP' })
      });
      const json = await res.json();
      if (json.success) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Upload receipt
  const triggerReceiptUpload = (orderId: string) => {
    setUploadingOrderId(orderId);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingOrderId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      try {
        const res = await fetch(`/api/orders/${uploadingOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptUrl: base64Url })
        });
        const json = await res.json();
        if (json.success) {
          loadData();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploadingOrderId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Deseja excluir este pedido permanentemente?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export CSV files
  const handleExportMainCSV = () => {
    const headers = ['ID', 'Cliente', 'Telefone', 'Email', 'Total (R$)', 'Status Pagamento', 'Data', 'Notas'];
    const rows = orders.map(o => [
      o.id,
      o.customerName,
      o.customerPhone,
      o.customerEmail || '',
      o.totalAmount.toString(),
      o.paymentStatus,
      new Date(o.createdAt).toLocaleDateString('pt-BR'),
      o.notes || ''
    ]);

    downloadCSV(headers, rows, 'ateel_pedidos_geral.csv');
  };

  const handleExportCorteCSV = () => {
    // Cutlist: count sum of quantity per product name + size
    const aggregation: { [key: string]: { name: string; size: string; quantity: number } } = {};

    orders.forEach(o => {
      (o.items || []).forEach(item => {
        if (item.productId) {
          const prod = item.product || products.find(p => p.id === item.productId);
          const name = prod ? prod.name : 'Produto';
          const size = item.size || 'Único';
          const key = `${name}-${size}`;
          if (aggregation[key]) {
            aggregation[key].quantity += item.quantity;
          } else {
            aggregation[key] = { name, size, quantity: item.quantity };
          }
        } else if (item.kitId) {
          const kit = item.kit || kits.find(k => k.id === item.kitId);
          const kitName = kit ? kit.name : 'Combo';
          // Kit items breakdown
          if (kit && kit.items) {
            kit.items.forEach(ki => {
              const kProd = ki.product || products.find(p => p.id === ki.productId);
              const name = kProd ? kProd.name : 'Produto';
              const size = item.size || 'M'; // size applied to kit is usually applied to the sizing elements
              const key = `${name}-${size}`;
              if (aggregation[key]) {
                aggregation[key].quantity += (ki.quantity * item.quantity);
              } else {
                aggregation[key] = { name, size, quantity: ki.quantity * item.quantity };
              }
            });
          }
        }
      });
    });

    const headers = ['Produto / Item', 'Tamanho', 'Quantidade Total para Confecção'];
    const rows = Object.values(aggregation).map(item => [
      item.name,
      item.size,
      item.quantity.toString()
    ]);

    downloadCSV(headers, rows, 'lista_corte_confeccao_ateel.csv');
  };

  const handleExportRetiradaCSV = () => {
    const headers = ['Cliente', 'WhatsApp/Telefone', 'Item/Combo Adquirido', 'Tamanho', 'Quantidade', 'Status Pagamento'];
    const rows: string[][] = [];

    orders.forEach(o => {
      (o.items || []).forEach(item => {
        let name = '';
        if (item.productId) {
          const prod = item.product || products.find(p => p.id === item.productId);
          name = prod ? prod.name : 'Produto';
        } else if (item.kitId) {
          const kit = item.kit || kits.find(k => k.id === item.kitId);
          name = kit ? `Kit: ${kit.name}` : 'Combo';
        }

        rows.push([
          o.customerName,
          o.customerPhone,
          name,
          item.size || 'Único',
          item.quantity.toString(),
          o.paymentStatus
        ]);
      });
    });

    downloadCSV(headers, rows, 'lista_retirada_entrega_ateel.csv');
  };

  const downloadCSV = (headers: string[], rows: string[][], filename: string) => {
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV handler
  const handleImportCSVOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
      if (lines.length <= 1) return;

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, ''));
        const customerName = row[1];
        const customerPhone = row[2];
        const totalAmount = parseFloat(row[4]) || 0;
        
        if (!customerName || !customerPhone) continue;

        const payload = {
          customerName,
          customerPhone,
          totalAmount,
          paymentStatus: 'PENDENTE',
          items: [] // In CSV imports without detailed item mappings, we populate empty items or assign a fallback product
        };

        try {
          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          importedCount++;
        } catch (err) {
          console.error(err);
        }
      }
      alert(`Importados ${importedCount} pedidos com sucesso!`);
      loadData();
    };
    reader.readAsText(file);
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customerPhone.includes(searchTerm) ||
                          o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || o.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-zinc-100">
      
      {/* Hidden file input for receipt uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            Pedidos, Comprovantes & Financeiro
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rastreie comprovantes Pix de pré-vendas, exporte a planilha de confecção e controle o break-even do lote
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportMainCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition duration-150"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pedidos</span>
          </button>

          <button
            onClick={handleExportCorteCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-xs font-bold text-primary hover:text-primary-foreground hover:bg-primary transition duration-150"
            title="Soma a quantidade de peças por tamanho de todos os pedidos"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lista de Corte (Confecção)</span>
          </button>

          <button
            onClick={handleExportRetiradaCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition duration-150"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Retirada</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition duration-150 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Importar</span>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleImportCSVOrders} 
            />
          </label>

          <button
            onClick={() => setShowWebhookModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition duration-150"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-yellow-400" />
            <span>Conectar Google Forms</span>
          </button>

          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow"
          >
            <Plus className="w-4 h-4 text-primary-foreground font-bold" />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>

      {/* Break-even & Viability Indicators Panel */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        
        {/* MOQ Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-primary" />
              Volume de Lote (MOQ)
            </span>
            <span className="font-bold text-white font-mono">{metrics.totalItemsCount} / {moqTarget} pçs</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-border/50">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(metrics.moqProgress, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Progresso: {metrics.moqProgress.toFixed(1)}%</span>
            <div className="flex items-center gap-1">
              <span>Meta MOQ:</span>
              <input 
                type="number" 
                value={moqTarget} 
                onChange={(e) => setMoqTarget(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-10 bg-secondary text-white font-bold text-center border border-border rounded font-mono"
              />
            </div>
          </div>
        </div>

        {/* Break Even Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Break-Even Financeiro
            </span>
            <span className="font-bold text-white font-mono">
              {formatCurrency(metrics.totalConfirmedRevenue)} / {formatCurrency(metrics.totalProductionCost)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-border/50">
            <div 
              className={`h-full transition-all duration-300 ${metrics.breakEvenReached ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${Math.min(metrics.breakEvenProgress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Arrecadação Confirmada: {metrics.breakEvenProgress.toFixed(1)}% do custo</span>
            <span>Est. Cost: {formatCurrency(metrics.totalProductionCost)}</span>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div className={`p-3 rounded-lg border text-xs leading-normal flex items-start gap-2.5 h-full justify-center flex-col ${
          metrics.breakEvenReached 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
            {metrics.breakEvenReached ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>Lote Viável</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Lote em Análise</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-zinc-300 leading-snug">
            {metrics.breakEvenReached 
              ? 'O faturamento pix validado já supera o custo total de fabricação estimado do lote. Viável para fechamento.'
              : 'O faturamento confirmado ainda está abaixo do custo de confecção estimado. Divulgar nas redes para garantir MOQ.'
            }
          </p>
        </div>

      </div>

      {/* Spreadsheet grid filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente, WhatsApp ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
          >
            <option value="">Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="AGUARDANDO_VALIDACAO">Aguardando Validação</option>
            <option value="PAGO_CONFIRMADO">Pago Confirmado</option>
          </select>
        </div>
      </div>

      {/* Orders Spreadsheet table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-secondary/40 border-b border-border text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">ID / Cliente</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3">Itens Comprados</th>
                <th className="p-3">Tamanhos</th>
                <th className="p-3 font-mono text-right">Total</th>
                <th className="p-3 text-center">Status Pix</th>
                <th className="p-3 text-center">Entrega</th>
                <th className="p-3 text-center">Comprovante</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground italic">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const hasReceipt = !!order.receiptUrl;
                  const isPaid = order.paymentStatus === 'PAGO_CONFIRMADO';
                  const isAwaiting = order.paymentStatus === 'AGUARDANDO_VALIDACAO';

                  return (
                    <tr key={order.id} className="hover:bg-secondary/15 transition-all">
                      {/* ID / Client */}
                      <td className="p-3">
                        <div className="font-semibold text-white">{order.customerName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{order.id}</div>
                      </td>

                      {/* Phone / Whatsapp */}
                      <td className="p-3">
                        <a 
                          href={`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-primary" />
                          <span className="font-mono">{order.customerPhone}</span>
                        </a>
                      </td>

                      {/* Purchased Items */}
                      <td className="p-3">
                        <div className="space-y-0.5">
                          {(order.items || []).map((item, idx) => {
                            let displayName = '';
                            if (item.productId) {
                              const prod = item.product || products.find(p => p.id === item.productId);
                              displayName = prod ? prod.name : 'Produto';
                            } else if (item.kitId) {
                              const kit = item.kit || kits.find(k => k.id === item.kitId);
                              displayName = kit ? `Kit: ${kit.name}` : 'Combo';
                            }
                            return (
                              <div key={idx} className="text-[11px] text-zinc-300 font-medium">
                                • {displayName} <span className="text-primary font-bold">x{item.quantity}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Sizes */}
                      <td className="p-3 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {Array.from(new Set((order.items || []).map(i => i.size).filter(Boolean))).map((size, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-bold font-mono">
                              {size}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="p-3 text-right font-bold font-mono text-white">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          isPaid 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : isAwaiting 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' 
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'
                        }`}>
                          {isPaid ? 'CONFIRMADO' : isAwaiting ? 'AGUARDANDO VALID.' : 'PENDENTE'}
                        </span>
                      </td>

                      {/* Delivery Status */}
                      <td className="p-3 text-center">
                        {order.deliveryStatus === 'DELIVERED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20" title={`Retirado por: ${order.pickedUpBy}`}>
                            ENTREGUE
                          </span>
                        ) : order.deliveryStatus === 'READY_FOR_PICKUP' ? (
                          <button
                            onClick={() => { setSelectedOrderForDelivery(order); setShowDeliveryModal(true); }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                          >
                            PRONTO PARA RETIRADA
                          </button>
                        ) : isPaid ? (
                          <button
                            onClick={() => handleSetReadyForPickup(order.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
                          >
                            SEPARAR
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-zinc-800/50 text-zinc-600 border-zinc-800/50">
                            -
                          </span>
                        )}
                      </td>

                      {/* Comprovante */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {hasReceipt ? (
                            <button
                              onClick={() => setSelectedOrderForReceipt(order)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground transition-all border border-border"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerReceiptUpload(order.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition duration-150"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Anexar</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => handleValidatePayment(order.id)}
                              className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition duration-150 flex items-center gap-0.5"
                              title="Confirmar pagamento Pix"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Validar</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 rounded bg-secondary hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition duration-150 border border-border"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTER NEW ORDER */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">Registrar Pedido de Pré-Venda</h3>
              </div>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    placeholder="ex: Artur Venâncio"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    placeholder="ex: 48999998888"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="ex: artur@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block font-semibold mb-1">Notas / Observações</label>
                <input
                  type="text"
                  placeholder="ex: Entregar junto com o Kit de Calouro na Sede"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>

              {/* Items builder */}
              <div className="p-3.5 rounded-lg border border-border bg-secondary/10 space-y-3">
                <h4 className="font-bold text-[10px] text-primary uppercase tracking-wider">Adicionar Itens ao Carrinho</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Tipo de Item</label>
                    <div className="flex bg-secondary border border-border rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setIsKitSelection(false)}
                        className={`flex-1 py-1 rounded text-center font-semibold text-[10px] transition ${!isKitSelection ? 'bg-primary text-primary-foreground' : 'text-zinc-400'}`}
                      >
                        Produto
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsKitSelection(true)}
                        className={`flex-1 py-1 rounded text-center font-semibold text-[10px] transition ${isKitSelection ? 'bg-primary text-primary-foreground' : 'text-zinc-400'}`}
                      >
                        Combo/Kit
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-zinc-400 mb-1">Escolha o Item</label>
                    {isKitSelection ? (
                      <select
                        value={selectedKitId}
                        onChange={(e) => setSelectedKitId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-medium"
                      >
                        {kits.map(k => (
                          <option key={k.id} value={k.id}>
                            {k.name} (Sócio: {formatCurrency(k.memberPrice)})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-medium"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Sócio: {formatCurrency(p.memberPrice || 0)})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Tamanho</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    >
                      <option value="PP">PP</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                      <option value="XGG">XGG</option>
                      <option value="ÚNICO">Único / Acessório</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Qtd</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none text-center font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Preço Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customPrice || ''}
                      onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-bold font-mono"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddItemToOrder}
                      className="w-full py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:text-primary transition duration-150 font-bold"
                    >
                      Adicionar Item
                    </button>
                  </div>
                </div>

                {/* Basket List */}
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground block">Carrinho do Pedido:</span>
                  {orderItems.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic text-center py-2">Nenhum item adicionado ainda.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-zinc-900 border border-border rounded px-3 py-1.5 text-[11px]">
                          <div>
                            <span className="font-semibold text-white">{item.name}</span>
                            <span className="text-primary font-bold ml-1.5">[{item.size}] x{item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-zinc-300 font-bold">{formatCurrency(item.unitPrice * item.quantity)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemFromOrder(idx)}
                              className="text-muted-foreground hover:text-red-400 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Subtotal row */}
                      <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-border/30 text-white">
                        <span>Valor Total do Pedido:</span>
                        <span className="font-mono text-primary text-sm">
                          {formatCurrency(orderItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            <div className="p-4 border-t border-border bg-secondary/30 shrink-0 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={orderItems.length === 0}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow"
              >
                Salvar Pedido
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: RECEIPT PREVIEW & CONFIRMATION */}
      {selectedOrderForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <div>
                <h3 className="font-bold text-foreground text-sm">Comprovante Pix</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Cliente: {selectedOrderForReceipt.customerName}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderForReceipt(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              
              {/* Image box */}
              <div className="w-full h-80 bg-zinc-900 border border-border rounded-lg overflow-hidden flex items-center justify-center relative">
                {selectedOrderForReceipt.receiptUrl ? (
                  <img 
                    src={selectedOrderForReceipt.receiptUrl} 
                    alt="Comprovante Pix"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-zinc-500 italic text-center p-4">
                    Nenhum comprovante anexado a este pedido.
                  </div>
                )}
              </div>

              {/* Order Info & Total */}
              <div className="flex justify-between items-center bg-secondary/20 p-2.5 rounded-lg border border-border/40 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase font-bold">Valor do Pedido</span>
                  <span className="font-bold font-mono text-white text-sm">{formatCurrency(selectedOrderForReceipt.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase font-bold text-right">Status Atual</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedOrderForReceipt.paymentStatus === 'PAGO_CONFIRMADO' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedOrderForReceipt.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Validate action */}
              {selectedOrderForReceipt.paymentStatus !== 'PAGO_CONFIRMADO' && (
                <button
                  type="button"
                  onClick={() => handleValidatePayment(selectedOrderForReceipt.id)}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition duration-150 flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Validar Pix & Confirmar Pedido</span>
                </button>
              )}

              <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
                {/* Option to re-upload / replace receipt */}
                <button
                  onClick={() => {
                    setSelectedOrderForReceipt(null);
                    triggerReceiptUpload(selectedOrderForReceipt.id);
                  }}
                  className="px-3 py-2 rounded-lg border border-border bg-secondary hover:text-white text-zinc-300 transition"
                >
                  Substituir Comprovante
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReceipt(null)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                >
                  Fechar
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: GOOGLE FORMS WEBHOOK INTEGRATION */}
      <GoogleFormsIntegrationModal 
        isOpen={showWebhookModal} 
        onClose={() => setShowWebhookModal(false)} 
      />

      {/* MODAL 4: DELIVERY CONFIRMATION */}
      {showDeliveryModal && selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <h3 className="font-bold text-foreground text-sm">Registrar Retirada</h3>
              <button 
                onClick={() => { setShowDeliveryModal(false); setPickedUpBy(''); }}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1">Quem está retirando o pedido?</label>
                <p className="text-[10px] text-zinc-500 mb-3">Nome da pessoa que está pegando os itens presencialmente.</p>
                <input
                  type="text"
                  placeholder="Nome de quem retirou"
                  value={pickedUpBy}
                  onChange={(e) => setPickedUpBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  autoFocus
                />
              </div>
              
              <div className="text-[10px] text-zinc-400 bg-zinc-900 p-2 rounded border border-zinc-800">
                <span className="block font-bold mb-1">Itens deste pedido:</span>
                <ul className="list-disc pl-4">
                  {(selectedOrderForDelivery.items || []).map((i: any, idx: number) => {
                    const prodName = i.product?.name || i.kit?.name || 'Item';
                    return <li key={idx}>{prodName} ({i.size}) x{i.quantity}</li>;
                  })}
                </ul>
              </div>

              <button
                type="button"
                onClick={handleRegisterDelivery}
                disabled={!pickedUpBy}
                className="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition duration-150 flex items-center justify-center gap-1.5 shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Package className="w-4 h-4 text-white" />
                <span>Confirmar Entrega</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
