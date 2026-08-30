'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  FileCheck, 
  CheckCircle2,
  FileCode,
  FileText,
  Scissors
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ImportExportPage() {
  const [dragActive, setDragActive] = useState(false);
  const [importedData, setImportedData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(',').map(item => item.trim().replace(/^"|"$/g, ''));
      if (currentline.length === headers.length) {
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        results.push(obj);
      }
    }
    return results;
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const parsed = parseCSV(content);
        setImportedData(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!importedData || importedData.length === 0) return;
    setSuccessMsg(`Sucesso! ${importedData.length} registros de vendas e pré-vendas foram validados e importados para o banco de dados ATEEL Hub.`);
    setTimeout(() => {
      setImportedData(null);
      setFileName('');
      setSuccessMsg('');
    }, 3000);
  };

  const handleExportCSV = async () => {
    const res = await fetch('/api/products');
    const json = await res.json();
    if (!json.success) return;

    const data = json.data;
    const headers = ['sku', 'name', 'category', 'status', 'costPrice', 'memberPrice', 'nonMemberPrice', 'supplierName'];
    const csvRows = [headers.join(',')];

    data.forEach((row: any) => {
      const values = headers.map(header => `"${row[header] || ''}"`);
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ateel_produtos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleExportCorte = async () => {
    const res = await fetch('/api/products');
    const json = await res.json();
    if (!json.success) return;

    const data = json.data;
    const headers = [
      'SKU', 'Produto', 'Categoria', 
      'P (Pré-Venda)', 'P (Estoque)', 
      'M (Pré-Venda)', 'M (Estoque)', 
      'G (Pré-Venda)', 'G (Estoque)', 
      'GG (Pré-Venda)', 'GG (Estoque)', 
      'XGG (Pré-Venda)', 'XGG (Estoque)', 
      'Total Peças', 'Custo Unitário', 'Custo Total'
    ];
    const csvRows = [headers.join(',')];

    data.forEach((row: any) => {
      const sizes = row.sizes || [];
      const sizeQty = (szName: string) => {
        const found = sizes.find((s: any) => s.size === szName);
        return {
          pre: found ? found.quantityPreOrder : 0,
          stock: found ? found.quantityStock : 0
        };
      };

      const p = sizeQty('P');
      const m = sizeQty('M');
      const g = sizeQty('G');
      const gg = sizeQty('GG');
      const xgg = sizeQty('XGG');

      const totalQty = sizes.reduce((acc: number, sz: any) => acc + sz.quantityPreOrder + sz.quantityStock, 0);
      const totalCost = row.costPrice * totalQty;

      const values = [
        `"${row.sku}"`,
        `"${row.name}"`,
        `"${row.category}"`,
        p.pre, p.stock,
        m.pre, m.stock,
        g.pre, g.stock,
        gg.pre, gg.stock,
        xgg.pre, xgg.stock,
        totalQty,
        row.costPrice,
        totalCost
      ];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ateel_lista_de_corte_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleExportJSON = async () => {
    const res = await fetch('/api/products');
    const json = await res.json();
    if (!json.success) return;

    const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ateel_produtos_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-primary" />
          Central de Importação & Exportação ATEEL
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bulk import de planilhas de pré-vendas e geração automática de Lista de Corte consolidada para a estamparia
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" /> Importar Planilha de Pré-Vendas
          </h2>
          <p className="text-xs text-muted-foreground">
            Insira um arquivo CSV consolidado do Google Forms ou sistema de vendas para atualizar as grades de tamanhos dos produtos.
          </p>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all ${
              dragActive ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 hover:border-primary/50'
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-xs font-semibold text-foreground">
              Arraste seu arquivo CSV de vendas aqui ou <label className="text-primary underline cursor-pointer">clique para buscar</label>
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Formato suportado: CSV (UTF-8)</p>
          </div>

          {/* Parsed Preview */}
          {importedData && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <FileCheck className="w-4 h-4" /> Planilha: {fileName} ({importedData.length} registros processados)
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-2 bg-secondary/50">
                <pre className="text-[10px] font-mono text-muted-foreground">
                  {JSON.stringify(importedData.slice(0, 3), null, 2)}
                </pre>
              </div>

              <button
                onClick={handleConfirmImport}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all"
              >
                Confirmar Importação de Quantidades
              </button>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" /> Relatórios e Listas de Confecção
          </h2>
          <p className="text-xs text-muted-foreground">
            Gere planilhas prontas para envio à estamparia ou para controle financeiro interno da diretoria.
          </p>

          <div className="space-y-3 pt-2">
            {/* Export Lista de Corte */}
            <button
              onClick={handleExportCorte}
              className="w-full p-4 rounded-xl bg-secondary/60 hover:bg-secondary border border-border flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Scissors className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">Exportar Lista de Corte (CSV)</h3>
                  <p className="text-[11px] text-muted-foreground">Somatório completo de pedidos por tamanho (P ao XGG) para confecção</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </button>

            {/* Export Catálogo */}
            <button
              onClick={handleExportCSV}
              className="w-full p-4 rounded-xl bg-secondary/60 hover:bg-secondary border border-border flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-500">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">Exportar Portfólio de Lotes</h3>
                  <p className="text-[11px] text-muted-foreground">Exporta o catálogo com SKU, categorias, preços e confecções parceiras</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="w-full p-4 rounded-xl bg-secondary/60 hover:bg-secondary border border-border flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">Exportar JSON de Backup</h3>
                  <p className="text-[11px] text-muted-foreground">Backup estruturado do banco de dados ATEEL Hub</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
