'use client';

import React, { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewProductModal({ isOpen, onClose, onSuccess }: NewProductModalProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Camiseta');
  const [status, setStatus] = useState('Briefing');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [fabricType, setFabricType] = useState('Algodão 100% Penteado');
  const [printTechnique, setPrintTechnique] = useState('Serigrafia / Silk-screen');
  const [supplierName, setSupplierName] = useState('');
  const [costPrice, setCostPrice] = useState<number>(15);
  const [memberPrice, setMemberPrice] = useState<number>(30);
  const [nonMemberPrice, setNonMemberPrice] = useState<number>(40);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name) {
      setError('Por favor preencha SKU e Nome do Produto.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          code: sku, // compatibilidade
          name,
          category,
          status,
          description,
          coverImageUrl,
          fabricType,
          printTechnique,
          supplierName: supplierName || 'A definir',
          costPrice: Number(costPrice),
          memberPrice: Number(memberPrice),
          nonMemberPrice: Number(nonMemberPrice)
        })
      });

      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
        // Reset form
        setSku('');
        setName('');
        setDescription('');
        setCoverImageUrl('');
        setSupplierName('');
      } else {
        setError(json.error || 'Erro ao criar produto');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado na criação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl p-6 relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Novo Produto ATEEL</h2>
            <p className="text-xs text-muted-foreground">Cadastre um novo item de vestuário, acessório ou merchandising</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-foreground">Código SKU *</label>
              <input
                type="text"
                placeholder="ex: ATL-CAM-01"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
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
                <option value="Camiseta">Camiseta</option>
                <option value="Samba-canção">Samba-canção</option>
                <option value="Meia">Meia</option>
                <option value="Jersey">Jersey</option>
                <option value="Caneca">Caneca</option>
                <option value="Tirante">Tirante</option>
                <option value="Moletom">Moletom</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-foreground">Nome do Produto *</label>
            <input
              type="text"
              placeholder="ex: Camiseta de Algodão Tigrão"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              required
            />
          </div>

          <ImageUpload
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            label="Imagem do Mockup / Capa do Lote"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-foreground">Tipo de Tecido / Material</label>
              <input
                type="text"
                placeholder="ex: Dry-fit, Algodão Penteado"
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-foreground">Técnica de Estampa</label>
              <input
                type="text"
                placeholder="ex: Sublimação, Serigrafia"
                value={printTechnique}
                onChange={(e) => setPrintTechnique(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-foreground">Estágio de Confecção</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              >
                <option value="Briefing">1. Briefing da Arte</option>
                <option value="Design">2. Design & Mockup</option>
                <option value="Cotação">3. Cotação & Amostra</option>
                <option value="Pré-Venda">4. Pré-Venda</option>
                <option value="Em Produção">5. Em Produção</option>
                <option value="Estoque">6. Em Estoque</option>
                <option value="Encerrado">7. Encerrado</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-foreground">Nome da Confecção / Fornecedor</label>
              <input
                type="text"
                placeholder="ex: Sul Confecções"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-foreground">Custo Unitário (R$)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-foreground">Preço Sócio (R$)</label>
              <input
                type="number"
                value={memberPrice}
                onChange={(e) => setMemberPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-foreground">Preço Não-Sócio (R$)</label>
              <input
                type="number"
                value={nonMemberPrice}
                onChange={(e) => setNonMemberPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-foreground">Descrição / Notas de Briefing</label>
            <textarea
              rows={2}
              placeholder="Descreva detalhes como cor de costura, botões, tamanhos especiais..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-primary-foreground font-bold" />
              <span>{submitting ? 'Criando...' : 'Cadastrar Lote'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
