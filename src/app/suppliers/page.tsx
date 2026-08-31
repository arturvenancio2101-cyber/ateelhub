'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Truck, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  MessageCircle, 
  Check, 
  X, 
  Star, 
  Download, 
  Upload, 
  PlusCircle, 
  FileSpreadsheet, 
  Info,
  Grid,
  MapPin,
  CreditCard,
  Percent
} from 'lucide-react';
import { Category, Supplier, ProductQuote, QuoteStatus } from '@/types/plm';

export default function SuppliersPage() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quotes, setQuotes] = useState<ProductQuote[]>([]);
  
  const [activeTab, setActiveTab] = useState<'quotes' | 'suppliers' | 'categories'>('quotes');
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals / Form state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  // Form Fields - Quotes
  const [quoteForm, setQuoteForm] = useState({
    productName: '',
    categoryId: '',
    supplierId: '',
    unitCost: '',
    minQuantity: '50',
    leadTimeDays: '',
    materialSpecs: '',
    printTechnique: '',
    status: 'EM_ANALISE' as QuoteStatus,
    notes: ''
  });

  // Form Fields - Suppliers
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    cityState: '',
    pixKey: '',
    paymentTerms: '',
    rating: 5,
    notes: ''
  });

  // Form Fields - Categories
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [resCat, resSup, resQuote] = await Promise.all([
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/suppliers').then(r => r.json()),
        fetch('/api/quotes').then(r => r.json())
      ]);

      if (resCat.success) setCategories(resCat.data);
      if (resSup.success) setSuppliers(resSup.data);
      if (resQuote.success) setQuotes(resQuote.data);
    } catch (err) {
      console.error('Erro ao buscar dados do fornecedor/cotações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category Actions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      if (data.success) {
        setCategories([...categories, data.data]);
        setCategoryForm({ name: '', description: '' });
        setShowCategoryModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deseja realmente remover esta categoria?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Supplier Actions
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name) return;

    const url = editingSupplierId ? `/api/suppliers/${editingSupplierId}` : '/api/suppliers';
    const method = editingSupplierId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      const data = await res.json();
      if (data.success) {
        if (editingSupplierId) {
          setSuppliers(suppliers.map(s => s.id === editingSupplierId ? data.data : s));
        } else {
          setSuppliers([...suppliers, data.data]);
        }
        setShowSupplierModal(false);
        setEditingSupplierId(null);
        setSupplierForm({
          name: '', contactName: '', phone: '', email: '',
          cityState: '', pixKey: '', paymentTerms: '', rating: 5, notes: ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplierId(supplier.id);
    setSupplierForm({
      name: supplier.name,
      contactName: supplier.contactName || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      cityState: supplier.cityState || '',
      pixKey: supplier.pixKey || '',
      paymentTerms: supplier.paymentTerms || '',
      rating: supplier.rating,
      notes: supplier.notes || ''
    });
    setShowSupplierModal(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Deseja realmente remover este fornecedor? Todas as cotações vinculadas serão apagadas.')) return;
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuppliers(suppliers.filter(s => s.id !== id));
        setQuotes(quotes.filter(q => q.supplierId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quote Actions
  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...quoteForm,
      unitCost: parseFloat(quoteForm.unitCost),
      minQuantity: parseInt(quoteForm.minQuantity),
      leadTimeDays: parseInt(quoteForm.leadTimeDays)
    };

    if (!payload.productName || !payload.categoryId || !payload.supplierId || isNaN(payload.unitCost) || isNaN(payload.leadTimeDays)) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const url = editingQuoteId ? `/api/quotes/${editingQuoteId}` : '/api/quotes';
    const method = editingQuoteId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (editingQuoteId) {
          setQuotes(quotes.map(q => q.id === editingQuoteId ? data.data : q));
        } else {
          setQuotes([data.data, ...quotes]);
        }
        setShowQuoteModal(false);
        setEditingQuoteId(null);
        setQuoteForm({
          productName: '', categoryId: '', supplierId: '', unitCost: '',
          minQuantity: '50', leadTimeDays: '', materialSpecs: '', printTechnique: '',
          status: 'EM_ANALISE', notes: ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditQuote = (quote: ProductQuote) => {
    setEditingQuoteId(quote.id);
    setQuoteForm({
      productName: quote.productName,
      categoryId: quote.categoryId,
      supplierId: quote.supplierId,
      unitCost: quote.unitCost.toString(),
      minQuantity: quote.minQuantity.toString(),
      leadTimeDays: quote.leadTimeDays.toString(),
      materialSpecs: quote.materialSpecs || '',
      printTechnique: quote.printTechnique || '',
      status: quote.status,
      notes: quote.notes || ''
    });
    setShowQuoteModal(true);
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Deseja realmente remover esta cotação?')) return;
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuotes(quotes.filter(q => q.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInlineStatusChange = async (quoteId: string, status: QuoteStatus) => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setQuotes(quotes.map(q => q.id === quoteId ? data.data : q));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllQuotes = async () => {
    if (!confirm('Tem certeza de que deseja apagar TODAS as cotações da planilha? Esta ação não poderá ser desfeita.')) return;
    try {
      const res = await fetch('/api/quotes?mode=all', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuotes([]);
        alert('Todas as cotações foram removidas com sucesso.');
      } else {
        alert(data.error || 'Erro ao limpar cotações');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearOrphanQuotes = async () => {
    if (!confirm('Deseja remover as cotações referentes a produtos que já foram excluídos do catálogo?')) return;
    try {
      const res = await fetch('/api/quotes?mode=orphan', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Cotações órfãs removidas!');
        loadData();
      } else {
        alert(data.error || 'Erro ao limpar cotações órfãs');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Import/Export Logic
  const handleExportCSV = (type: 'quotes' | 'suppliers') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (type === 'quotes') {
      headers = ['ID', 'Produto', 'Categoria ID', 'Categoria', 'Fornecedor ID', 'Fornecedor', 'Custo Unitario (R$)', 'MOQ (Pecas)', 'Prazo de Confeccao (Dias)', 'Especificacao Tecido', 'Tecnica de Estampa', 'Status', 'Observacoes'];
      rows = quotes.map(q => [
        q.id,
        q.productName,
        q.categoryId,
        q.category?.name || '',
        q.supplierId,
        q.supplier?.name || '',
        q.unitCost.toString(),
        q.minQuantity.toString(),
        q.leadTimeDays.toString(),
        q.materialSpecs || '',
        q.printTechnique || '',
        q.status,
        q.notes || ''
      ]);
      filename = 'ateel_cotacoes_produtos.csv';
    } else {
      headers = ['ID', 'Nome Fornecedor', 'Contato', 'WhatsApp', 'Email', 'Cidade/Estado', 'Chave Pix', 'Condicoes de Pagamento', 'Avaliacao', 'Notas'];
      rows = suppliers.map(s => [
        s.id,
        s.name,
        s.contactName || '',
        s.phone || '',
        s.email || '',
        s.cityState || '',
        s.pixKey || '',
        s.paymentTerms || '',
        s.rating.toString(),
        s.notes || ''
      ]);
      filename = 'ateel_fornecedores.csv';
    }

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>, type: 'quotes' | 'suppliers') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, ''));
        
        if (type === 'suppliers') {
          const name = row[1];
          if (!name) continue;
          const payload = {
            name,
            contactName: row[2] || '',
            phone: row[3] || '',
            email: row[4] || '',
            cityState: row[5] || '',
            pixKey: row[6] || '',
            paymentTerms: row[7] || '',
            rating: parseInt(row[8]) || 5,
            notes: row[9] || ''
          };
          try {
            await fetch('/api/suppliers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            importedCount++;
          } catch (err) {
            console.error(err);
          }
        } else {
          const productName = row[1];
          const categoryName = row[3];
          const supplierName = row[5];
          if (!productName || !categoryName || !supplierName) continue;

          // Find or create category/supplier
          let category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
          if (!category) {
            const res = await fetch('/api/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: categoryName })
            }).then(r => r.json());
            if (res.success) {
              category = res.data;
              categories.push(res.data);
            }
          }

          let supplier = suppliers.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
          if (!supplier) {
            const res = await fetch('/api/suppliers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: supplierName })
            }).then(r => r.json());
            if (res.success) {
              supplier = res.data;
              suppliers.push(res.data);
            }
          }

          if (category && supplier) {
            const payload = {
              productName,
              categoryId: category.id,
              supplierId: supplier.id,
              unitCost: parseFloat(row[6]) || 0,
              minQuantity: parseInt(row[7]) || 50,
              leadTimeDays: parseInt(row[8]) || 15,
              materialSpecs: row[9] || '',
              printTechnique: row[10] || '',
              status: (row[11] as QuoteStatus) || 'EM_ANALISE',
              notes: row[12] || ''
            };
            try {
              await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              importedCount++;
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
      alert(`Importação concluída! ${importedCount} registros foram inseridos.`);
      loadData();
    };
    reader.readAsText(file);
  };

  // Filtered Lists
  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (q.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || q.categoryId === categoryFilter;
    const matchesStatus = statusFilter === '' || q.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredSuppliers = suppliers.filter(s => {
    return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (s.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (s.cityState || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  // KPIs
  const totalSuppliersCount = suppliers.length;
  const approvedQuotes = quotes.filter(q => q.status === 'APROVADO');
  const cheapestQuote = approvedQuotes.length > 0 
    ? [...approvedQuotes].sort((a, b) => a.unitCost - b.unitCost)[0]
    : null;
  const avgLeadTime = approvedQuotes.length > 0
    ? Math.round(approvedQuotes.reduce((acc, curr) => acc + curr.leadTimeDays, 0) / approvedQuotes.length)
    : 0;

  return (
    <div className="flex-1 min-h-screen bg-zinc-950 text-zinc-100 flex flex-col p-6 overflow-y-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Central de Fornecedores & Cotações
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão de confecções, cotações ativas, controle de MOQ e planilha de compras integrada ATEEL.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportCSV(activeTab === 'suppliers' ? 'suppliers' : 'quotes')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition duration-150"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition duration-150 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Importar CSV
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={(e) => handleImportCSV(e, activeTab === 'suppliers' ? 'suppliers' : 'quotes')}
            />
          </label>
          
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition duration-150"
          >
            <Plus className="w-3.5 h-3.5" />
            Categoria
          </button>

          <button
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition duration-150"
          >
            <Plus className="w-3.5 h-3.5" />
            Fornecedor
          </button>

          {activeTab === 'quotes' && (
            <>
              <button
                onClick={handleClearOrphanQuotes}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition duration-150"
                title="Remover cotações de produtos excluídos"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Órfãs
              </button>

              <button
                onClick={handleClearAllQuotes}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition duration-150"
                title="Zerar todas as cotações da planilha"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Zerar Cotações
              </button>
            </>
          )}

          <button
            onClick={() => setShowQuoteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-md shadow-primary/10 transition duration-150"
          >
            <Plus className="w-4 h-4 text-primary-foreground font-bold" />
            Nova Cotação
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Parceiros Ativos</span>
            <h3 className="text-xl font-bold font-mono mt-1 text-white">{totalSuppliersCount}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Confecções homologadas</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Cotações Registradas</span>
            <h3 className="text-xl font-bold font-mono mt-1 text-white">{quotes.length}</h3>
            <p className="text-[10px] text-zinc-400 mt-1">
              {quotes.filter(q => q.status === 'EM_ANALISE').length} em análise de viabilidade
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Melhor Lead Time</span>
            <h3 className="text-xl font-bold font-mono mt-1 text-emerald-400">
              {avgLeadTime > 0 ? `${avgLeadTime} dias` : 'N/A'}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">Média das cotações aprovadas</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Custo Mínimo Aprovado</span>
            <h3 className="text-xl font-bold font-mono mt-1 text-primary">
              {cheapestQuote ? `R$ ${cheapestQuote.unitCost.toFixed(2)}` : 'N/A'}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 truncate">
              {cheapestQuote ? cheapestQuote.productName : 'Sem cotações aprovadas'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800/80">
        <button
          onClick={() => { setActiveTab('quotes'); setSearchTerm(''); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition duration-150 -mb-[2px] ${
            activeTab === 'quotes' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Planilha de Cotações (Airtable Style)
        </button>
        <button
          onClick={() => { setActiveTab('suppliers'); setSearchTerm(''); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition duration-150 -mb-[2px] ${
            activeTab === 'suppliers' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Fornecedores Homologados
        </button>
        <button
          onClick={() => { setActiveTab('categories'); setSearchTerm(''); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition duration-150 -mb-[2px] ${
            activeTab === 'categories' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Categorias Dinâmicas
        </button>
      </div>

      {/* Search and Filter bar */}
      {activeTab !== 'categories' && (
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={
                activeTab === 'quotes' 
                  ? 'Buscar por produto ou confecção...' 
                  : 'Buscar por nome, contato ou cidade...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800/80 rounded-lg py-2 pl-10 pr-4 text-xs text-foreground placeholder-zinc-500 focus:outline-none focus:border-primary font-medium"
            />
          </div>

          {/* Quotes Specific Filters */}
          {activeTab === 'quotes' && (
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 font-semibold focus:outline-none"
              >
                <option value="">Todas as Categorias</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 font-semibold focus:outline-none"
              >
                <option value="">Todos os Status</option>
                <option value="APROVADO">Aprovada</option>
                <option value="EM_ANALISE">Em Análise</option>
                <option value="RECUSADO">Recusada</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-zinc-500">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
          <span className="text-xs font-semibold">Carregando dados da diretoria...</span>
        </div>
      ) : activeTab === 'quotes' ? (
        /* Planilha Inteligente - Notion/Airtable Grid */
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4 text-right">Custo Unitário</th>
                  <th className="py-3 px-4 text-center">MOQ (Mínimo)</th>
                  <th className="py-3 px-4 text-center">Prazo (Dias)</th>
                  <th className="py-3 px-4">Especificação</th>
                  <th className="py-3 px-4">Técnica Estampa</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-zinc-500 font-medium">
                      Nenhuma cotação encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-zinc-900/40 font-mono transition">
                      <td className="py-3 px-4 font-sans font-bold text-white max-w-[160px] truncate">
                        {q.productName}
                      </td>
                      <td className="py-3 px-4 font-sans text-zinc-300">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-semibold">
                          {q.category?.name || 'Sem cat'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-zinc-300">
                        {q.supplier?.name || 'Desconhecido'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-primary">
                        R$ {q.unitCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-300">
                        {q.minQuantity} un
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-300">
                        {q.leadTimeDays}d
                      </td>
                      <td className="py-3 px-4 font-sans text-zinc-400 max-w-[150px] truncate" title={q.materialSpecs || ''}>
                        {q.materialSpecs || '-'}
                      </td>
                      <td className="py-3 px-4 font-sans text-zinc-400 max-w-[150px] truncate" title={q.printTechnique || ''}>
                        {q.printTechnique || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={q.status}
                          onChange={(e) => handleInlineStatusChange(q.id, e.target.value as QuoteStatus)}
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider focus:outline-none ${
                            q.status === 'APROVADO'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : q.status === 'RECUSADO'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          <option className="bg-zinc-900 text-zinc-300" value="EM_ANALISE">Em Análise</option>
                          <option className="bg-zinc-900 text-emerald-400" value="APROVADO">Aprovado</option>
                          <option className="bg-zinc-900 text-rose-400" value="RECUSADO">Recusado</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditQuote(q)}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                            title="Editar Cotação"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Excluir Cotação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'suppliers' ? (
        /* Grid de Fornecedores Homologados */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 font-semibold">
              Nenhum fornecedor cadastrado.
            </div>
          ) : (
            filteredSuppliers.map((s) => (
              <div 
                key={s.id} 
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col justify-between hover:border-zinc-700/80 transition duration-150 relative overflow-hidden"
              >
                <div>
                  {/* Top header card */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.name}</h4>
                      {s.contactName && (
                        <p className="text-[10px] text-zinc-400 mt-0.5">Contato: {s.contactName}</p>
                      )}
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-0.5 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {s.rating}.0
                    </div>
                  </div>

                  {/* Body Contact details */}
                  <div className="space-y-2 text-xs border-t border-zinc-800/80 pt-3 text-zinc-300">
                    {s.cityState && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{s.cityState}</span>
                      </div>
                    )}
                    
                    {s.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase w-10">Email</span>
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}

                    {s.pixKey && (
                      <div className="flex items-center gap-2 bg-zinc-950/40 border border-zinc-800/40 p-1.5 rounded">
                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                        <div className="text-[10px] font-mono truncate">
                          <span className="text-zinc-500 block text-[8px] font-bold uppercase tracking-wider">Chave Pix</span>
                          {s.pixKey}
                        </div>
                      </div>
                    )}

                    {s.paymentTerms && (
                      <div className="flex items-center gap-2">
                        <Percent className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-[11px]">{s.paymentTerms}</span>
                      </div>
                    )}

                    {s.notes && (
                      <p className="text-[10px] text-zinc-400 italic bg-zinc-900/60 p-2 rounded mt-2 max-h-[60px] overflow-y-auto">
                        "{s.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-4 gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditSupplier(s)}
                      className="p-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(s.id)}
                      className="p-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {s.phone && (
                    <a
                      href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}?text=Olá%20${s.contactName || s.name},%20falamos%20da%20Diretoria%20de%20Produtos%20da%20ATEEL!%20Gostaríamos%20de%20conversar%20sobre%20as%20nossas%20cotações.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 text-[10px] tracking-wide shadow-md shadow-emerald-500/10 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      WHATSAPP
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Categorias Dinâmicas */
        <div className="max-w-xl mx-auto border border-zinc-800 rounded-xl bg-zinc-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-bold text-white text-sm">Categorias Cadastradas</h3>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
              {categories.length} ativas
            </span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {categories.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{c.name}</h4>
                  {c.description && (
                    <p className="text-[10px] text-zinc-400 mt-0.5">{c.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Remover Categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Nova/Editar Cotação */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingQuoteId ? 'Editar Cotação' : 'Cadastrar Nova Cotação'}
              </h3>
              <button 
                onClick={() => { setShowQuoteModal(false); setEditingQuoteId(null); }}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuote} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tirante Especial UFSC"
                  value={quoteForm.productName}
                  onChange={(e) => setQuoteForm({ ...quoteForm, productName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    required
                    value={quoteForm.categoryId}
                    onChange={(e) => setQuoteForm({ ...quoteForm, categoryId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Fornecedor *
                  </label>
                  <select
                    required
                    value={quoteForm.supplierId}
                    onChange={(e) => setQuoteForm({ ...quoteForm, supplierId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">Selecione...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Custo Unitário (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.50"
                    value={quoteForm.unitCost}
                    onChange={(e) => setQuoteForm({ ...quoteForm, unitCost: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    MOQ (Mínimo)
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={quoteForm.minQuantity}
                    onChange={(e) => setQuoteForm({ ...quoteForm, minQuantity: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Prazo (Dias Úteis) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={quoteForm.leadTimeDays}
                    onChange={(e) => setQuoteForm({ ...quoteForm, leadTimeDays: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Especificações Tecido
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Algodão 30.1 penteado"
                    value={quoteForm.materialSpecs}
                    onChange={(e) => setQuoteForm({ ...quoteForm, materialSpecs: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Técnica de Estampa
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sublimação total digital"
                    value={quoteForm.printTechnique}
                    onChange={(e) => setQuoteForm({ ...quoteForm, printTechnique: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={quoteForm.status}
                  onChange={(e) => setQuoteForm({ ...quoteForm, status: e.target.value as QuoteStatus })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="EM_ANALISE">Em Análise</option>
                  <option value="APROVADO">Aprovada</option>
                  <option value="RECUSADO">Recusada</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Observações Internas
                </label>
                <textarea
                  rows={3}
                  placeholder="Restrições de pagamento, prazo especial para jogos, etc..."
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowQuoteModal(false); setEditingQuoteId(null); }}
                  className="px-4 py-2 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95"
                >
                  Salvar Cotação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Novo/Editar Fornecedor */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingSupplierId ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
              </h3>
              <button 
                onClick={() => { setShowSupplierModal(false); setEditingSupplierId(null); }}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Nome da Confecção *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sul Sport Uniformes"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Nome do Contato
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Santos"
                    value={supplierForm.contactName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    WhatsApp (Apenas Números)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5547999999999"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    E-mail do Fornecedor
                  </label>
                  <input
                    type="email"
                    placeholder="vendas@fornecedor.com"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Cidade/Estado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Brusque/SC"
                    value={supplierForm.cityState}
                    onChange={(e) => setSupplierForm({ ...supplierForm, cityState: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Chave Pix
                  </label>
                  <input
                    type="text"
                    placeholder="CNPJ, Celular ou E-mail"
                    value={supplierForm.pixKey}
                    onChange={(e) => setSupplierForm({ ...supplierForm, pixKey: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Condições de Pagamento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 50% entrada + 50% entrega"
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Avaliação (1 a 5 estrelas)
                  </label>
                  <select
                    value={supplierForm.rating}
                    onChange={(e) => setSupplierForm({ ...supplierForm, rating: parseInt(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="5">5 estrelas (Excelente)</option>
                    <option value="4">4 estrelas (Bom)</option>
                    <option value="3">3 estrelas (Regular)</option>
                    <option value="2">2 estrelas (Ruim)</option>
                    <option value="1">1 estrela (Péssimo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Notas sobre a Confecção
                </label>
                <textarea
                  rows={3}
                  placeholder="Comentários sobre qualidade do tecido, fidelidade das cores e pontualidade na entrega..."
                  value={supplierForm.notes}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowSupplierModal(false); setEditingSupplierId(null); }}
                  className="px-4 py-2 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95"
                >
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nova Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Cadastrar Nova Categoria</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bucket Hat"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Chapéus e gorros com estampas personalizadas"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
