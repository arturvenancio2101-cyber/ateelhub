'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Idea, Category, IdeaVote } from '@/types/plm';
import { 
  Lightbulb, 
  ThumbsUp, 
  Plus, 
  User, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Image as ImageIcon,
  Users,
  Download,
  X,
  Check,
  MessageCircle,
  Sparkles,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  Folder
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Suggestion Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Camiseta');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Form states
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Camiseta');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCreatedBy, setEditCreatedBy] = useState('');
  const [editStatus, setEditStatus] = useState('Em Análise');
  const [updating, setUpdating] = useState(false);

  // Delete modal state
  const [deletingIdea, setDeletingIdea] = useState<Idea | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Voting Modal states
  const [selectedIdeaForVote, setSelectedIdeaForVote] = useState<Idea | null>(null);
  const [voterName, setVoterName] = useState('');
  const [voterPhone, setVoterPhone] = useState('');
  const [voterCourse, setVoterCourse] = useState('');
  const [intendsToBuy, setIntendsToBuy] = useState(false);
  const [preferredSize, setPreferredSize] = useState('M');
  const [voting, setVoting] = useState(false);

  // Interested Modal states
  const [selectedIdeaForList, setSelectedIdeaForList] = useState<Idea | null>(null);
  const [votesList, setVotesList] = useState<IdeaVote[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [voterSearchQuery, setVoterSearchQuery] = useState('');

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ideas');
      const json = await res.json();
      if (json.success) setIdeas(json.data);
    } catch (err) {
      console.error('Erro ao buscar ideias:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
        if (json.data.length > 0) {
          setCategory(json.data[0].name);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  useEffect(() => {
    fetchIdeas();
    fetchCategories();
  }, []);

  const openVoteModal = (idea: Idea) => {
    setSelectedIdeaForVote(idea);
    setVoterName('');
    setVoterPhone('');
    setVoterCourse('');
    setIntendsToBuy(false);
    setPreferredSize('M');
  };

  const submitVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdeaForVote || !voterName) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/ideas/${selectedIdeaForVote.id}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName,
          voterPhone: voterPhone || undefined,
          voterCourse: voterCourse || undefined,
          intendsToBuy,
          preferredSize
        })
      });
      const json = await res.json();
      if (json.success) {
        setSelectedIdeaForVote(null);
        fetchIdeas();
      }
    } catch (err) {
      console.error('Erro ao votar:', err);
    } finally {
      setVoting(false);
    }
  };

  const openInterestedModal = async (idea: Idea) => {
    setSelectedIdeaForList(idea);
    setVoterSearchQuery('');
    setLoadingVotes(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}/votes`);
      const json = await res.json();
      if (json.success) {
        setVotesList(json.data);
      }
    } catch (err) {
      console.error('Erro ao buscar votantes:', err);
    } finally {
      setLoadingVotes(false);
    }
  };

  const openEditModal = (idea: Idea) => {
    setEditingIdea(idea);
    setEditTitle(idea.title);
    setEditCategory(idea.category);
    setEditDescription(idea.description || '');
    setEditImageUrl(idea.imageUrl || '');
    setEditCreatedBy(idea.createdBy || '');
    setEditStatus(idea.status || 'Em Análise');
  };

  const handleUpdateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdea || !editTitle || !editCategory) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/ideas/${editingIdea.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          category: editCategory,
          description: editDescription,
          imageUrl: editImageUrl,
          createdBy: editCreatedBy,
          status: editStatus
        })
      });
      const json = await res.json();
      if (json.success) {
        setEditingIdea(null);
        fetchIdeas();
      } else {
        alert(json.error || 'Erro ao atualizar ideia');
      }
    } catch (err) {
      console.error('Erro ao editar ideia:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteIdea = async () => {
    if (!deletingIdea) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ideas/${deletingIdea.id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setDeletingIdea(null);
        fetchIdeas();
      } else {
        alert(json.error || 'Erro ao excluir ideia');
      }
    } catch (err) {
      console.error('Erro ao excluir ideia:', err);
    } finally {
      setDeleting(false);
    }
  };

  const exportVotesCSV = () => {
    if (!selectedIdeaForList || votesList.length === 0) return;
    
    const headers = ['Nome', 'WhatsApp/Telefone', 'Curso/Fase', 'Interesse de Compra', 'Tamanho Pretendido', 'Data'];
    const rows = votesList.map(v => [
      v.voterName,
      v.voterPhone || '',
      v.voterCourse || '',
      v.intendsToBuy ? 'Sim (Lead Quente)' : 'Não',
      v.preferredSize || '',
      new Date(v.createdAt).toLocaleDateString('pt-BR')
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${selectedIdeaForList.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1576871337622-98d48d435353?auto=format&fit=crop&q=80&w=200',
          createdBy: createdBy || 'Diretoria ATEEL'
        })
      });
      const json = await res.json();
      if (json.success) {
        setTitle('');
        setDescription('');
        setImageUrl('');
        setCreatedBy('');
        setShowAddForm(false);
        fetchIdeas();
      }
    } catch (err) {
      console.error('Erro ao criar ideia:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveIdea = async (idea: Idea) => {
    try {
      // 1. Cadastra a ideia como produto no pipeline
      const resProd = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: `ATL-${idea.category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
          name: idea.title,
          category: idea.category,
          description: idea.description || 'Produto criado a partir do Brainstorming de ideias.',
          coverImageUrl: idea.imageUrl || '',
          status: 'Briefing', // Estágio inicial
          costPrice: 15.00,
          memberPrice: 30.00,
          nonMemberPrice: 40.00
        })
      });
      const jsonProd = await resProd.json();

      if (jsonProd.success) {
        const newProductId = jsonProd.data.id;
        // 2. Atualiza o status da ideia para 'Aprovada'
        await fetch(`/api/ideas/${idea.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'status',
            status: 'Aprovada',
            productId: newProductId
          })
        });
        alert(`Ideia "${idea.title}" aprovada! Produto criado com sucesso no pipeline de confecção.`);
        fetchIdeas();
      }
    } catch (err) {
      console.error('Erro ao aprovar ideia:', err);
    }
  };

  const filteredVotes = votesList.filter(vote => {
    if (!voterSearchQuery) return true;
    const q = voterSearchQuery.toLowerCase();
    return (
      vote.voterName.toLowerCase().includes(q) ||
      (vote.voterPhone && vote.voterPhone.toLowerCase().includes(q)) ||
      (vote.voterCourse && vote.voterCourse.toLowerCase().includes(q)) ||
      (vote.preferredSize && vote.preferredSize.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary animate-pulse" />
            Central de Ideias & Brainstorming (ATEEL)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mural colaborativo para sugerir, editar, auditar intenções de compra/votos e gerenciar novos produtos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/folders"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 text-xs font-semibold transition-all"
          >
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Pastas de Exemplos</span>
          </Link>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-all shadow"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Fechar Formulário' : 'Sugerir Nova Ideia'}</span>
          </button>
        </div>
      </div>

      {/* Suggestion Form */}
      {showAddForm && (
        <form onSubmit={handleCreateIdea} className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4 max-w-lg animate-in fade-in slide-in-from-top-4 duration-150 text-xs">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-primary" /> Sugerir Nova Ideia de Produto
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-foreground">Título do Produto / Arte *</label>
              <input
                type="text"
                placeholder="ex: Bucket Hat Dupla Face"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-foreground">Categoria *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              >
                {categories.length > 0 ? (
                  categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Camiseta">Camiseta</option>
                    <option value="Samba-canção">Samba-canção</option>
                    <option value="Meia">Meia</option>
                    <option value="Jersey">Jersey</option>
                    <option value="Caneca">Caneca</option>
                    <option value="Tirante">Tirante</option>
                    <option value="Moletom">Moletom</option>
                    <option value="Outro">Outro</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                label="Link ou Upload da Imagem/Referência"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-foreground">Sugerido por (Nome/Cargo)</label>
              <input
                type="text"
                placeholder="ex: Diretora Júlia (Mkt)"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-foreground">Descrição da Ideia & Detalhes da Estampa</label>
            <textarea
              rows={3}
              placeholder="Explique o design, as cores, estampas pretendidas e inspirações..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow"
          >
            {submitting ? 'Postando...' : 'Publicar no Mural'}
          </button>
        </form>
      )}

      {/* Ideas Mural Grid */}
      {loading ? (
        <div className="text-center p-12 text-xs text-indigo-400 font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Carregando ideias...
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center p-12 text-xs text-muted-foreground italic border border-dashed border-border rounded-xl">
          Nenhuma ideia sugerida ainda. Seja o primeiro a postar!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => {
            const isApproved = idea.status === 'Aprovada';
            const isDiscarded = idea.status === 'Descartada';
            return (
              <div 
                key={idea.id}
                className="rounded-xl border border-border bg-card shadow hover:border-primary/45 transition-all flex flex-col justify-between overflow-hidden group relative"
              >
                {/* Visual Cover Mockup */}
                <div className="h-44 w-full relative bg-secondary overflow-hidden flex items-center justify-center border-b border-border/60">
                  {idea.imageUrl ? (
                    <img 
                      src={idea.imageUrl} 
                      alt={idea.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  )}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-primary flex items-center gap-1 backdrop-blur-xs">
                    <Tag className="w-3 h-3 text-primary" /> {idea.category}
                  </span>
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-xs ${
                    isApproved 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : isDiscarded 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {idea.status}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-foreground leading-tight">{idea.title}</h3>
                    
                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(idea)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-all"
                        title="Editar ideia"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingIdea(idea)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Deletar ideia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {idea.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>

                {/* Actions & Votes */}
                <div className="p-4 border-t border-border/60 bg-secondary/20 flex flex-col gap-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px] text-[10px]">{idea.createdBy || 'Diretoria'}</span>
                    </div>

                    <button
                      onClick={() => openInterestedModal(idea)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold transition-all"
                      title="Ver todos que votaram e cadastraram intenção nesta ideia"
                    >
                      <Users className="w-3 h-3" />
                      <span>Ver Votantes ({idea.votesCount})</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                    {/* Vote Button */}
                    <button
                      onClick={() => openVoteModal(idea)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground transition-all border border-border font-medium"
                      title="Votar e demonstrar interesse"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Votar / Apoiar</span>
                      <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-background/50 text-[10px]">{idea.votesCount}</span>
                    </button>

                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        onClick={() => handleApproveIdea(idea)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-sm"
                        title="Promover para pipeline de desenvolvimento"
                      >
                        <span>Aprovar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: VOTING FORM */}
      {selectedIdeaForVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm">Registrar Apoio / Voto</h3>
              </div>
              <button 
                onClick={() => setSelectedIdeaForVote(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitVote} className="p-4 space-y-4">
              <p className="text-muted-foreground text-[11px] leading-normal mb-2 bg-primary/10 border border-primary/20 p-2.5 rounded-lg">
                Você está votando em: <strong className="text-foreground">{selectedIdeaForVote.title}</strong>. 
                Deixe seus dados para sabermos o tamanho da demanda na UFSC!
              </p>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="ex: Artur Venâncio"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="ex: 48999998888"
                    value={voterPhone}
                    onChange={(e) => setVoterPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Curso e Fase</label>
                  <input
                    type="text"
                    placeholder="ex: Engenharia Elétrica / 5ª"
                    value={voterCourse}
                    onChange={(e) => setVoterCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Tamanho Preferido</label>
                  <select
                    value={preferredSize}
                    onChange={(e) => setPreferredSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
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

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-foreground font-semibold">
                    <input
                      type="checkbox"
                      checked={intendsToBuy}
                      onChange={(e) => setIntendsToBuy(e.target.checked)}
                      className="rounded bg-secondary border-border text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>Quero comprar no lançamento!</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIdeaForVote(null)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={voting}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow flex items-center gap-1.5"
                >
                  {voting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Votando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-primary-foreground" />
                      <span>Confirmar Voto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERESTED VOTERS LIST (QUEM VOTOU) */}
      {selectedIdeaForList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="font-bold text-foreground text-sm">Lista de Votantes & Intenção de Compra</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Demanda e dados de quem votou em: <strong className="text-white">{selectedIdeaForList.title}</strong></p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIdeaForList(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Actions & Filters row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search in votes */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, WhatsApp ou curso..."
                    value={voterSearchQuery}
                    onChange={(e) => setVoterSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <div className="text-[11px] text-muted-foreground">
                    Total: <strong className="text-white font-mono">{votesList.length}</strong> 
                    {votesList.length > 0 && (
                      <span> 
                        {' '}(<strong className="text-primary font-mono">{votesList.filter(v => v.intendsToBuy).length}</strong> leads quentes)
                      </span>
                    )}
                  </div>

                  {votesList.length > 0 && (
                    <button
                      onClick={exportVotesCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all text-[10px] shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar Leads (CSV)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="border border-border rounded-lg overflow-hidden bg-secondary/10 max-h-80 overflow-y-auto">
                {loadingVotes ? (
                  <div className="text-center p-8 text-muted-foreground flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Buscando votantes...
                  </div>
                ) : filteredVotes.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground italic">
                    {voterSearchQuery ? 'Nenhum votante encontrado para a busca.' : 'Nenhum voto cadastrado nesta ideia ainda.'}
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="p-2.5">Nome do Votante</th>
                        <th className="p-2.5">WhatsApp / Contato</th>
                        <th className="p-2.5">Curso / Fase</th>
                        <th className="p-2.5 text-center">Tamanho</th>
                        <th className="p-2.5 text-right">Intenção Compra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredVotes.map((vote) => (
                        <tr key={vote.id} className="hover:bg-secondary/20 transition-all">
                          <td className="p-2.5 font-semibold text-white">{vote.voterName}</td>
                          <td className="p-2.5 font-mono text-[10px] text-zinc-300">
                            {vote.voterPhone ? (
                              <a 
                                href={`https://wa.me/${vote.voterPhone}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-1 text-emerald-400 hover:underline bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-400" />
                                <span>{vote.voterPhone}</span>
                              </a>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-zinc-300">{vote.voterCourse || '-'}</td>
                          <td className="p-2.5 text-center font-bold text-primary font-mono">{vote.preferredSize || '-'}</td>
                          <td className="p-2.5 text-right">
                            {vote.intendsToBuy ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 animate-pulse">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                                Lead Quente
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px]">
                                Apenas Voto
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-border/40">
                <button
                  onClick={() => setSelectedIdeaForList(null)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT IDEA MODAL */}
      {editingIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm">Editar Ideia</h3>
              </div>
              <button 
                onClick={() => setEditingIdea(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateIdea} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Título do Produto / Arte *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Categoria *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  >
                    {categories.length > 0 ? (
                      categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="Camiseta">Camiseta</option>
                        <option value="Samba-canção">Samba-canção</option>
                        <option value="Meia">Meia</option>
                        <option value="Jersey">Jersey</option>
                        <option value="Caneca">Caneca</option>
                        <option value="Tirante">Tirante</option>
                        <option value="Moletom">Moletom</option>
                        <option value="Outro">Outro</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Status da Ideia</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  >
                    <option value="Em Análise">Em Análise</option>
                    <option value="Aprovada">Aprovada</option>
                    <option value="Descartada">Descartada</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Sugerido por (Nome/Cargo)</label>
                  <input
                    type="text"
                    value={editCreatedBy}
                    onChange={(e) => setEditCreatedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <ImageUpload
                  value={editImageUrl}
                  onChange={setEditImageUrl}
                  label="Link ou Upload da Imagem/Referência"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Descrição & Detalhes</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setEditingIdea(null)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/95 transition-all shadow flex items-center gap-1.5"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-primary-foreground" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION MODAL */}
      {deletingIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-border bg-rose-500/10">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Excluir Ideia</h3>
              </div>
              <button 
                onClick={() => setDeletingIdea(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-zinc-300 leading-relaxed">
                Tem certeza que deseja excluir a ideia <strong className="text-white">"{deletingIdea.title}"</strong>? 
                Esta ação apagará permanentemente a ideia e todo o histórico de votos vinculados a ela.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingIdea(null)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteIdea}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow flex items-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Sim, Excluir Ideia</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
