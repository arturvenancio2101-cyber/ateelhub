'use client';

import React, { useState, useEffect } from 'react';
import { ProductFolder, FolderItem } from '@/types/plm';
import {
  Folder,
  FolderPlus,
  Plus,
  Search,
  Tag,
  Calendar,
  Sparkles,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ArrowRight,
  Lightbulb,
  Layers,
  RefreshCw,
  X,
  Check,
  Filter,
  DollarSign,
  Info,
  FolderOpen
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  }
};

export default function FoldersPage() {
  const [folders, setFolders] = useState<ProductFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('TODAS');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Folder states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<ProductFolder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [folderCategory, setFolderCategory] = useState('Vestuário');
  const [folderColor, setFolderColor] = useState('amber');
  const [savingFolder, setSavingFolder] = useState(false);

  // Delete Folder state
  const [deletingFolder, setDeletingFolder] = useState<ProductFolder | null>(null);

  // Modal Item states
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FolderItem | null>(null);
  const [targetFolderIdForItem, setTargetFolderIdForItem] = useState<string>('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemTags, setItemTags] = useState('');
  const [itemEstimatedPrice, setItemEstimatedPrice] = useState('');
  const [itemYearOrSeason, setItemYearOrSeason] = useState('');
  const [itemStatus, setItemStatus] = useState('Exemplo Realizado');
  const [itemNotes, setItemNotes] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  // Delete Item state
  const [deletingItem, setDeletingItem] = useState<FolderItem | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/folders');
      const json = await res.json();
      if (json.success) {
        setFolders(json.data);
      }
    } catch (err) {
      console.error('Erro ao carregar pastas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Open Create Folder modal
  const openCreateFolderModal = () => {
    setEditingFolder(null);
    setFolderName('');
    setFolderDescription('');
    setFolderCategory('Vestuário');
    setFolderColor('amber');
    setShowFolderModal(true);
  };

  // Open Edit Folder modal
  const openEditFolderModal = (folder: ProductFolder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderDescription(folder.description || '');
    setFolderCategory(folder.category || 'Vestuário');
    setFolderColor(folder.color || 'amber');
    setShowFolderModal(true);
  };

  // Save Folder (Create or Update)
  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName) return;
    setSavingFolder(true);

    try {
      if (editingFolder) {
        const res = await fetch(`/api/folders/${editingFolder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: folderName,
            description: folderDescription,
            category: folderCategory,
            color: folderColor
          })
        });
        const json = await res.json();
        if (json.success) {
          triggerToast(`Pasta "${folderName}" atualizada!`);
          setShowFolderModal(false);
          fetchFolders();
        }
      } else {
        const res = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: folderName,
            description: folderDescription,
            category: folderCategory,
            color: folderColor
          })
        });
        const json = await res.json();
        if (json.success) {
          triggerToast(`Pasta "${folderName}" criada com sucesso!`);
          setShowFolderModal(false);
          fetchFolders();
        }
      }
    } catch (err) {
      console.error('Erro ao salvar pasta:', err);
    } finally {
      setSavingFolder(false);
    }
  };

  // Delete Folder
  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;
    try {
      const res = await fetch(`/api/folders/${deletingFolder.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        triggerToast(`Pasta "${deletingFolder.name}" deletada.`);
        if (selectedFolderId === deletingFolder.id) setSelectedFolderId('ALL');
        setDeletingFolder(null);
        fetchFolders();
      }
    } catch (err) {
      console.error('Erro ao deletar pasta:', err);
    }
  };

  // Open Create Item modal
  const openCreateItemModal = (folderId?: string) => {
    const fId = folderId || (selectedFolderId !== 'ALL' ? selectedFolderId : folders[0]?.id || '');
    setTargetFolderIdForItem(fId);
    setEditingItem(null);
    setItemTitle('');
    setItemDescription('');
    setItemImageUrl('');
    setItemTags('');
    setItemEstimatedPrice('');
    setItemYearOrSeason('');
    setItemStatus('Exemplo Realizado');
    setItemNotes('');
    setShowItemModal(true);
  };

  // Open Edit Item modal
  const openEditItemModal = (item: FolderItem) => {
    setEditingItem(item);
    setTargetFolderIdForItem(item.folderId);
    setItemTitle(item.title);
    setItemDescription(item.description || '');
    setItemImageUrl(item.imageUrl || '');
    setItemTags(Array.isArray(item.tags) ? item.tags.join(', ') : '');
    setItemEstimatedPrice(item.estimatedPrice || '');
    setItemYearOrSeason(item.yearOrSeason || '');
    setItemStatus(item.status || 'Exemplo Realizado');
    setItemNotes(item.notes || '');
    setShowItemModal(true);
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !targetFolderIdForItem) return;
    setSavingItem(true);

    const parsedTags = itemTags
      ? itemTags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    try {
      if (editingItem) {
        const res = await fetch(`/api/folders/items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: itemTitle,
            description: itemDescription,
            imageUrl: itemImageUrl,
            tags: parsedTags,
            estimatedPrice: itemEstimatedPrice,
            yearOrSeason: itemYearOrSeason,
            status: itemStatus,
            notes: itemNotes
          })
        });
        const json = await res.json();
        if (json.success) {
          triggerToast(`Exemplo "${itemTitle}" atualizado!`);
          setShowItemModal(false);
          fetchFolders();
        }
      } else {
        const res = await fetch(`/api/folders/${targetFolderIdForItem}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: itemTitle,
            description: itemDescription,
            imageUrl: itemImageUrl,
            tags: parsedTags,
            estimatedPrice: itemEstimatedPrice,
            yearOrSeason: itemYearOrSeason,
            status: itemStatus,
            notes: itemNotes
          })
        });
        const json = await res.json();
        if (json.success) {
          triggerToast(`Exemplo "${itemTitle}" adicionado à pasta!`);
          setShowItemModal(false);
          fetchFolders();
        }
      }
    } catch (err) {
      console.error('Erro ao salvar item:', err);
    } finally {
      setSavingItem(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      const res = await fetch(`/api/folders/items/${deletingItem.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        triggerToast(`Exemplo "${deletingItem.title}" deletado.`);
        setDeletingItem(null);
        fetchFolders();
      }
    } catch (err) {
      console.error('Erro ao deletar item:', err);
    }
  };

  // Promote item to Ideas Central
  const handlePromoteToIdea = async (item: FolderItem, folderName?: string) => {
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          category: folderName?.includes('Samba') ? 'Samba-canção' : folderName?.includes('Tirante') ? 'Tirante' : 'Outro',
          description: `Ideia promovida da pasta "${folderName || 'Exemplos'}": ${item.description || ''}`,
          imageUrl: item.imageUrl || '',
          createdBy: 'Acervo de Exemplos'
        })
      });
      const json = await res.json();
      if (json.success) {
        triggerToast(`💡 "${item.title}" enviada para a Central de Ideias (Brainstorming)!`);
      }
    } catch (err) {
      console.error('Erro ao promover para ideia:', err);
    }
  };

  // Promote item to Products Pipeline
  const handlePromoteToProduct = async (item: FolderItem, folderName?: string) => {
    try {
      const category = folderName?.includes('Samba') ? 'Samba-canção' : folderName?.includes('Tirante') ? 'Tirante' : 'Camiseta';
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: `ATL-${category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
          name: item.title,
          category,
          description: `Produto oriundo da Pasta de Exemplos ("${folderName || 'Acervo'}"): ${item.description || ''}`,
          coverImageUrl: item.imageUrl || '',
          status: 'Briefing',
          costPrice: 20.00,
          memberPrice: 40.00,
          nonMemberPrice: 55.00
        })
      });
      const json = await res.json();
      if (json.success) {
        triggerToast(`🚀 "${item.title}" criada no Pipeline de Produção (PLM)!`);
      }
    } catch (err) {
      console.error('Erro ao promover para produto:', err);
    }
  };

  // Category options for filter
  const categoriesList = ['TODAS', ...Array.from(new Set(folders.map(f => f.category)))];

  // Filter items across selected folder and search/category query
  const allItemsWithFolder = folders.flatMap(f => (f.items || []).map(item => ({ ...item, folder: f })));

  const filteredFolders = folders.filter(f => {
    if (selectedCategoryFilter !== 'TODAS' && f.category !== selectedCategoryFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return f.name.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q));
  });

  const displayedItems = allItemsWithFolder.filter(item => {
    if (selectedFolderId !== 'ALL' && item.folderId !== selectedFolderId) return false;
    if (selectedCategoryFilter !== 'TODAS' && item.folder.category !== selectedCategoryFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const tagsStr = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      tagsStr.includes(q) ||
      (item.yearOrSeason && item.yearOrSeason.toLowerCase().includes(q))
    );
  });

  const totalItemsCount = folders.reduce((acc, f) => acc + (f.items?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-white animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-amber-400" />
            Pastas de Exemplos & Banco de Ideias
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize coleções temáticas com mockups, referências de produtos antigos e protótipos para inspirar futuras coleções.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateItemModal()}
            disabled={folders.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>Adicionar Exemplo</span>
          </button>

          <button
            onClick={openCreateFolderModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nova Pasta</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total de Pastas</p>
            <p className="text-2xl font-bold text-foreground font-mono mt-0.5">{folders.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Folder className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Exemplos & Referências</p>
            <p className="text-2xl font-bold text-foreground font-mono mt-0.5">{totalItemsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Filtro Selecionado</p>
            <p className="text-sm font-bold text-foreground mt-1 truncate">
              {selectedFolderId === 'ALL' ? 'Exibindo Todas as Pastas' : folders.find(f => f.id === selectedFolderId)?.name || 'Pasta Específica'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Filter className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título, tag, ano ou palavras-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Folder Selection Cards Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            Minhas Pastas Temáticas ({filteredFolders.length})
          </h2>

          {selectedFolderId !== 'ALL' && (
            <button
              onClick={() => setSelectedFolderId('ALL')}
              className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
            >
              Ver Todas as Pastas
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Carregando acervo de pastas...
          </div>
        ) : folders.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            Nenhuma pasta criada ainda. Clique em "Nova Pasta" para organizar seus produtos!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* "All Folders" Card */}
            <button
              onClick={() => setSelectedFolderId('ALL')}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                selectedFolderId === 'ALL'
                  ? 'bg-primary/10 border-primary shadow-md'
                  : 'bg-card border-border hover:border-muted-foreground/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  {totalItemsCount} itens
                </span>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-sm text-foreground">Todas as Pastas</h3>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">Visão consolidada de todas as ideias</p>
              </div>
            </button>

            {/* Folder Cards */}
            {filteredFolders.map(folder => {
              const colorStyle = COLOR_MAP[folder.color] || COLOR_MAP.amber;
              const isSelected = selectedFolderId === folder.id;
              const itemCount = folder.items?.length || 0;

              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? `${colorStyle.bg} ${colorStyle.border} shadow-md ring-2 ring-primary/40`
                      : 'bg-card border-border hover:border-muted-foreground/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-9 h-9 rounded-lg ${colorStyle.bg} ${colorStyle.text} flex items-center justify-center border ${colorStyle.border}`}>
                      <Folder className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colorStyle.badge}`}>
                        {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                      </span>

                      {/* Folder Action dropdown / buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditFolderModal(folder);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                        title="Editar pasta"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingFolder(folder);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Excluir pasta"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">{folder.name}</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {folder.description || 'Sem descrição cadastrada.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items Section inside Selected Folder */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Exemplos & Ideias {selectedFolderId !== 'ALL' && `na pasta "${folders.find(f => f.id === selectedFolderId)?.name}"`}
            </h2>
            <p className="text-xs text-muted-foreground">
              Mostrando <strong className="text-foreground">{displayedItems.length}</strong> referências e protótipos de produtos
            </p>
          </div>

          <button
            onClick={() => openCreateItemModal(selectedFolderId !== 'ALL' ? selectedFolderId : undefined)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Novo Exemplo</span>
          </button>
        </div>

        {displayedItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl space-y-3">
            <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p>Nenhum exemplo ou mockup cadastrado nesta visualização.</p>
            <button
              onClick={() => openCreateItemModal(selectedFolderId !== 'ALL' ? selectedFolderId : undefined)}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs transition-all shadow"
            >
              + Adicionar Primeiro Exemplo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.map((item) => {
              const folderColorStyle = COLOR_MAP[item.folder.color] || COLOR_MAP.amber;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-card shadow hover:border-primary/45 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Image Header */}
                  <div className="h-48 w-full relative bg-secondary overflow-hidden flex items-center justify-center border-b border-border/60">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[10px]">Sem Imagem</span>
                      </div>
                    )}

                    {/* Folder Badge top-left */}
                    <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs ${folderColorStyle.badge}`}>
                      <Folder className="w-3 h-3" /> {item.folder.name}
                    </span>

                    {/* Status Badge top-right */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white backdrop-blur-xs border border-white/10">
                      {item.status}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-foreground leading-tight">{item.title}</h3>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditItemModal(item)}
                          className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-all"
                          title="Editar item"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Deletar item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {item.description || 'Sem descrição cadastrada.'}
                    </p>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {item.yearOrSeason && (
                        <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-mono font-semibold flex items-center gap-1 border border-border">
                          <Calendar className="w-3 h-3 text-muted-foreground" /> {item.yearOrSeason}
                        </span>
                      )}

                      {item.estimatedPrice && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold flex items-center gap-0.5 border border-emerald-500/20">
                          <DollarSign className="w-3 h-3" /> {item.estimatedPrice}
                        </span>
                      )}

                      {Array.isArray(item.tags) && item.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold flex items-center gap-1 border border-primary/20">
                          <Tag className="w-2.5 h-2.5" /> {tag}
                        </span>
                      ))}
                    </div>

                    {item.notes && (
                      <div className="p-2 rounded-lg bg-secondary/40 border border-border/50 text-[10px] text-muted-foreground flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 border-t border-border/60 bg-secondary/20 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => handlePromoteToIdea(item, item.folder.name)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-all"
                      title="Transformar este exemplo em uma Ideia para votação"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Promover p/ Ideia</span>
                    </button>

                    <button
                      onClick={() => handlePromoteToProduct(item, item.folder.name)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold transition-all shadow-sm"
                      title="Enviar diretamente para o Pipeline de Fabricação"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Criar Produto</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: CREATE / EDIT FOLDER */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-foreground text-sm">
                  {editingFolder ? 'Editar Pasta' : 'Criar Nova Pasta de Exemplos'}
                </h3>
              </div>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="p-4 space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-foreground">Nome da Pasta *</label>
                <input
                  type="text"
                  placeholder="ex: Moletons & Jaquetas Inverno 2024"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Categoria Principal</label>
                  <select
                    value={folderCategory}
                    onChange={(e) => setFolderCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  >
                    <option value="Vestuário">Vestuário</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Outono/Inverno">Outono/Inverno</option>
                    <option value="Merchandising">Merchandising</option>
                    <option value="Eventos & Kits">Eventos & Kits</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">Cor de Destaque</label>
                  <select
                    value={folderColor}
                    onChange={(e) => setFolderColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  >
                    <option value="amber">Âmbar (Laranja)</option>
                    <option value="emerald">Esmeralda (Verde)</option>
                    <option value="purple">Púrpura (Roxo)</option>
                    <option value="blue">Azul</option>
                    <option value="rose">Rosa/Vermelho</option>
                    <option value="cyan">Ciano (Azul Claro)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Descrição / Objetivo da Pasta</label>
                <textarea
                  rows={3}
                  placeholder="Explique o propósito desta pasta ou tipo de produtos reunidos aqui..."
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingFolder}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow flex items-center gap-1.5"
                >
                  {savingFolder ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-primary-foreground" />
                      <span>{editingFolder ? 'Atualizar Pasta' : 'Salvar Pasta'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT FOLDER ITEM */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm">
                  {editingItem ? 'Editar Exemplo' : 'Adicionar Novo Exemplo de Produto'}
                </h3>
              </div>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-4 space-y-4 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block font-semibold mb-1 text-foreground">Pasta Destino *</label>
                <select
                  value={targetFolderIdForItem}
                  onChange={(e) => setTargetFolderIdForItem(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-semibold"
                  required
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Título do Exemplo / Produto *</label>
                <input
                  type="text"
                  placeholder="ex: Samba-Canção Estampa Neon 2023"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <ImageUpload
                  value={itemImageUrl}
                  onChange={setItemImageUrl}
                  label="Imagem, Mockup ou Foto do Produto"
                  placeholder="Cole o link da imagem ou faça upload..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Ano / Edição / Temporada</label>
                  <input
                    type="text"
                    placeholder="ex: 2023.2, Verão 2025"
                    value={itemYearOrSeason}
                    onChange={(e) => setItemYearOrSeason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">Preço ou Custo Estimado</label>
                  <input
                    type="text"
                    placeholder="ex: R$ 45,00 ou Custo R$ 18,00"
                    value={itemEstimatedPrice}
                    onChange={(e) => setItemEstimatedPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Status do Exemplo</label>
                  <select
                    value={itemStatus}
                    onChange={(e) => setItemStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  >
                    <option value="Exemplo Realizado">Exemplo Realizado</option>
                    <option value="Conceito Guardado">Conceito Guardado</option>
                    <option value="Referência Externa">Referência Externa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="ex: DryFit, Sublimado, BestSeller"
                    value={itemTags}
                    onChange={(e) => setItemTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Descrição & Detalhes da Peça</label>
                <textarea
                  rows={2}
                  placeholder="Explique os materiais, técnicas de impressão, receptividade dos alunos..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Notas Internas / Fornecedor</label>
                <input
                  type="text"
                  placeholder="ex: Fornecedor Brusque Brindes, MOQ 100un."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow flex items-center gap-1.5"
                >
                  {savingItem ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-primary-foreground" />
                      <span>{editingItem ? 'Atualizar Exemplo' : 'Salvar Exemplo'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION FOLDER */}
      {deletingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-xs">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" /> Confirmar Exclusão de Pasta
            </h3>
            <p className="text-muted-foreground">
              Tem certeza que deseja excluir a pasta <strong className="text-white">{deletingFolder.name}</strong>? 
              Isso também removerá todos os exemplos contidos nela.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingFolder(null)}
                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteFolder}
                className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all"
              >
                Excluir Pasta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION ITEM */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-xs">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" /> Confirmar Exclusão de Exemplo
            </h3>
            <p className="text-muted-foreground">
              Tem certeza que deseja excluir o exemplo <strong className="text-white">{deletingItem.title}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all"
              >
                Excluir Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
