'use client';

import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';

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
            Mural colaborativo da diretoria para sugerir, auditar intenções de compra e promover novos produtos à confecção
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-all shadow"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Fechar Formulário' : 'Sugerir Nova Ideia'}</span>
        </button>
      </div>

      {/* Suggestion Form */}
      {showAddForm && (
        <form onSubmit={handleCreateIdea} className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-4 max-w-lg animate-in fade-in slide-in-from-top-4 duration-150 text-xs">
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
                {/* Dynamically load categories */}
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
              <label className="block font-semibold mb-1 text-foreground">Link da Imagem / Referência</label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
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
            return (
              <div 
                key={idea.id}
                className="rounded-xl border border-border bg-card shadow hover:border-primary/45 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Cover Mockup */}
                <div className="h-44 w-full relative bg-secondary overflow-hidden flex items-center justify-center border-b border-border/60">
                  {idea.imageUrl ? (
                    <img 
                      src={idea.imageUrl} 
                      alt={idea.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  )}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-primary flex items-center gap-1">
                    <Tag className="w-3 h-3 text-primary" /> {idea.category}
                  </span>
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold ${
                    isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {idea.status}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2 flex-1">
                  <h3 className="font-bold text-sm text-foreground leading-tight">{idea.title}</h3>
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
                      className="flex items-center gap-1 text-primary hover:underline text-[10px] font-semibold"
                    >
                      <Users className="w-3 h-3" />
                      <span>Ver Interessados</span>
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

      {/* MODAL 2: INTERESTED VOTERS LIST */}
      {selectedIdeaForList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-border rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="font-bold text-foreground text-sm">Lista de Interessados & Apoios</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Mapeamento de demanda real para: {selectedIdeaForList.title}</p>
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
              {/* Actions row */}
              <div className="flex items-center justify-between gap-4">
                <div className="text-[11px] text-muted-foreground">
                  Total de votantes: <strong className="text-white font-mono">{votesList.length}</strong> 
                  {votesList.length > 0 && (
                    <span> 
                      {' '}(<strong className="text-primary font-mono">{votesList.filter(v => v.intendsToBuy).length}</strong> com intenção de compra)
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

              {/* Table */}
              <div className="border border-border rounded-lg overflow-hidden bg-secondary/10 max-h-80 overflow-y-auto">
                {loadingVotes ? (
                  <div className="text-center p-8 text-muted-foreground flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Buscando lista...
                  </div>
                ) : votesList.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground italic">
                    Nenhum voto ou cadastro nesta ideia ainda.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="p-2.5">Nome</th>
                        <th className="p-2.5">WhatsApp</th>
                        <th className="p-2.5">Curso/Fase</th>
                        <th className="p-2.5 text-center">Tamanho</th>
                        <th className="p-2.5 text-right">Intenção Compra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {votesList.map((vote) => (
                        <tr key={vote.id} className="hover:bg-secondary/20 transition-all">
                          <td className="p-2.5 font-semibold text-white">{vote.voterName}</td>
                          <td className="p-2.5 font-mono text-[10px] text-zinc-300">
                            {vote.voterPhone ? (
                              <a 
                                href={`https://wa.me/${vote.voterPhone}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <MessageCircle className="w-3 h-3 text-primary" />
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
    </div>
  );
}
