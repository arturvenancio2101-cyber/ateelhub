'use client';

import React, { useState, useEffect } from 'react';
import { KanbanItem, KanbanStage, Priority } from '@/types/plm';
import { 
  Kanban, 
  Plus, 
  Target, 
  Calendar, 
  User, 
  Flag,
  MoreVertical,
  CheckCircle2,
  Circle,
  PackagePlus,
  Trash2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

const COLUMNS: { id: KanbanStage; label: string; color: string }[] = [
  { id: 'IDEA', label: 'Ideia / Backlog', color: 'border-zinc-800 bg-zinc-950/20' },
  { id: 'DESIGN', label: 'Design & Mockups', color: 'border-blue-500/20 bg-blue-500/5' },
  { id: 'QUOTATION', label: 'Cotação & Amostra', color: 'border-purple-500/20 bg-purple-500/5' },
  { id: 'PRE_SALE', label: 'Pré-Venda (Site)', color: 'border-primary/20 bg-primary/5' },
  { id: 'PRODUCTION', label: 'Em Produção', color: 'border-amber-500/20 bg-amber-500/5' },
  { id: 'PICKUP', label: 'Retirada / Entrega', color: 'border-indigo-500/20 bg-indigo-500/5' },
  { id: 'DONE', label: 'Concluído', color: 'border-emerald-500/20 bg-emerald-500/5' }
];

const PRIORITIES: { id: Priority; label: string; color: string }[] = [
  { id: 'LOW', label: 'Baixa', color: 'text-zinc-400 bg-zinc-500/10' },
  { id: 'MEDIUM', label: 'Média', color: 'text-blue-400 bg-blue-500/10' },
  { id: 'HIGH', label: 'Alta', color: 'text-amber-400 bg-amber-500/10' },
  { id: 'URGENT', label: 'Urgente', color: 'text-rose-400 bg-rose-500/10' }
];

export default function RoadmapPage() {
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWeekly, setFilterWeekly] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  
  // Drag state
  const [draggedItem, setDraggedItem] = useState<KanbanItem | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KanbanItem | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<KanbanStage>('IDEA');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [isWeeklyFocus, setIsWeeklyFocus] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kanban');
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      const url = editingItem ? `/api/kanban/${editingItem.id}` : '/api/kanban';
      const method = editingItem ? 'PATCH' : 'POST';
      const body = { title, description, stage, priority, isWeeklyFocus, assignedTo, dueDate };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenNew = (stageId?: KanbanStage) => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setStage(stageId || 'IDEA');
    setPriority('MEDIUM');
    setIsWeeklyFocus(false);
    setAssignedTo('');
    setDueDate('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KanbanItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setStage(item.stage);
    setPriority(item.priority);
    setIsWeeklyFocus(item.isWeeklyFocus);
    setAssignedTo(item.assignedTo || '');
    setDueDate(item.dueDate ? item.dueDate.split('T')[0] : '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente apagar esta tarefa/ideia?')) return;
    try {
      await fetch(`/api/kanban/${id}`, { method: 'DELETE' });
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (id: string) => {
    if (!confirm('Criar produto oficial no Catálogo a partir deste card?')) return;
    try {
      const res = await fetch(`/api/kanban/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_product' })
      });
      const json = await res.json();
      if (json.success) {
        alert('Produto criado com sucesso no Catálogo e vinculado a esta tarefa!');
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, item: KanbanItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: KanbanStage) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.stage === targetStage) return;

    // Optimistic UI update
    setItems(items.map(i => i.id === draggedItem.id ? { ...i, stage: targetStage } : i));
    setDraggedItem(null);

    // API Update
    try {
      await fetch(`/api/kanban/${draggedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetStage })
      });
    } catch (err) {
      console.error(err);
      fetchItems(); // revert on fail
    }
  };

  // Get unique assignees
  const assignees = Array.from(new Set(items.map(i => i.assignedTo).filter(Boolean)));

  const filteredItems = items.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchWeekly = filterWeekly ? i.isWeeklyFocus : true;
    const matchAssignee = filterAssignee === 'ALL' || i.assignedTo === filterAssignee;
    return matchSearch && matchWeekly && matchAssignee;
  });

  return (
    <div className="space-y-6 h-full flex flex-col pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Kanban className="w-6 h-6 text-primary" />
            Roadmap & Tarefas Semanais
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Acompanhe o desenvolvimento de novas ideias, produtos e tarefas do time.
          </p>
        </div>
        <button
          onClick={() => handleOpenNew()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => setFilterWeekly(!filterWeekly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all font-semibold ${
              filterWeekly 
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Target className="w-4 h-4" /> Foco da Semana
          </button>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-semibold focus:outline-none"
          >
            <option value="ALL">Todos os Responsáveis</option>
            {assignees.map(a => <option key={a!} value={a!}>{a}</option>)}
          </select>

          <button onClick={fetchItems} className="p-2 rounded bg-secondary hover:bg-secondary/80 text-foreground border border-border">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max h-full items-start">
          {COLUMNS.map(col => {
            const colItems = filteredItems.filter(i => i.stage === col.id);
            return (
              <div 
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`w-72 rounded-xl border p-3 flex flex-col min-h-[500px] bg-secondary/10 ${col.color}`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3 select-none">
                  <span className="font-bold text-xs uppercase tracking-wider">{col.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-border text-[10px] font-mono font-bold text-muted-foreground">
                    {colItems.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {colItems.map(item => {
                    const priorityStyle = PRIORITIES.find(p => p.id === item.priority);
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => handleOpenEdit(item)}
                        className="bg-card border border-border/80 rounded-lg p-3 shadow-sm hover:border-primary/50 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
                      >
                        {item.isWeeklyFocus && (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold tracking-wider">
                              <Target className="w-3 h-3" /> FOCO DA SEMANA
                            </span>
                          </div>
                        )}
                        
                        <h4 className="font-bold text-sm text-foreground leading-snug mb-1">{item.title}</h4>
                        
                        {item.description && (
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Metadata tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2 border-t border-border/40">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${priorityStyle?.color}`}>
                            {priorityStyle?.label}
                          </span>
                          
                          {item.assignedTo && (
                            <span className="flex items-center gap-1 text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                              <User className="w-3 h-3" /> {item.assignedTo}
                            </span>
                          )}

                          {item.dueDate && (
                            <span className="flex items-center gap-1 text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                              <Calendar className="w-3 h-3" /> {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>

                        {/* Actions overlay */}
                        <div className="hidden group-hover:flex absolute top-2 right-2 items-center gap-1 bg-card/90 backdrop-blur rounded p-0.5 border border-border shadow-lg">
                          {(item.stage === 'QUOTATION' || item.stage === 'DESIGN') && !item.productId && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCreateProduct(item.id); }}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded"
                              title="Transformar em Produto no Catálogo"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.productId && (
                          <div className="mt-2 text-[9px] text-primary flex items-center gap-1 font-semibold">
                            <PackagePlus className="w-3 h-3" /> Vinculado ao Catálogo
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Empty state add button */}
                  <button
                    onClick={() => handleOpenNew(col.id)}
                    className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground border border-dashed border-border/60 rounded-lg hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Kanban className="w-4 h-4 text-primary" /> 
                {editingItem ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-4 space-y-4 overflow-y-auto text-xs flex-1">
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Título da Tarefa/Ideia *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  placeholder="ex: Desenvolver Caneca Preta Fosca"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Descrição / Notas</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  placeholder="Detalhes adicionais, links de referência, etc..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Estágio Atual</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as KanbanStage)}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Responsável</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Nome do membro..."
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Prazo (Opcional)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={isWeeklyFocus}
                    onChange={(e) => setIsWeeklyFocus(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/50 bg-secondary border-border"
                  />
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Target className="w-4 h-4" /> Marcar como Foco da Semana
                  </div>
                </label>
              </div>

            </form>
            
            <div className="p-4 border-t border-border bg-secondary/30 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded bg-secondary text-foreground hover:bg-secondary/80 font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveItem}
                disabled={saving}
                className="px-4 py-2 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-1"
              >
                {saving ? 'Salvando...' : 'Salvar Tarefa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
