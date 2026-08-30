'use client';

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Code, 
  Info, 
  Layers, 
  Link, 
  Play, 
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface GoogleFormsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleFormsIntegrationModal({ isOpen, onClose }: GoogleFormsIntegrationModalProps) {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'script' | 'trigger'>('info');

  if (!isOpen) return null;

  // Resolve API dynamic URL or default
  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}/api/webhooks/google-forms`
    : 'http://localhost:3000/api/webhooks/google-forms';
  
  const webhookSecret = 'ateel-secret-key-2026';

  const appsScriptCode = `/**
 * Script do Google Apps Script para integrar respostas com o ATEEL Products Hub.
 * Associe este script ao seu Formulário (Extensões > Apps Script) e configure o Acionador (Trigger).
 */
function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();
  
  var data = {
    customerName: "",
    customerPhone: "",
    customerEmail: formResponse.getRespondentEmail() || "",
    itemType: "PRODUCT", // Padrão: PRODUCT (será atualizado para KIT se detectado "combo" ou "kit")
    itemName: "",
    size: "M",
    quantity: 1,
    totalAmount: 0.0, // A API recalcula do catálogo caso venha zerado
    receiptUrl: "",
    notes: ""
  };
  
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var title = itemResponse.getItem().getTitle().toLowerCase();
    var response = itemResponse.getResponse();
    
    if (title.indexOf("nome") !== -1) {
      data.customerName = response;
    } else if (title.indexOf("whatsapp") !== -1 || title.indexOf("telefone") !== -1 || title.indexOf("celular") !== -1) {
      data.customerPhone = response;
    } else if (title.indexOf("email") !== -1 || title.indexOf("e-mail") !== -1) {
      data.customerEmail = response;
    } else if (title.indexOf("produto") !== -1 || title.indexOf("item") !== -1 || title.indexOf("vestuário") !== -1) {
      data.itemName = response;
      data.itemType = "PRODUCT";
    } else if (title.indexOf("combo") !== -1 || title.indexOf("kit") !== -1) {
      data.itemName = response;
      data.itemType = "KIT";
    } else if (title.indexOf("tamanho") !== -1) {
      data.size = response;
    } else if (title.indexOf("quantidade") !== -1 || title.indexOf("qtd") !== -1) {
      data.quantity = parseInt(response) || 1;
    } else if (title.indexOf("valor") !== -1 || title.indexOf("preço") !== -1 || title.indexOf("total") !== -1) {
      // Remove R$, pontos e converte para número
      var cleanVal = String(response).replace(/[R$\\s.]/g, "").replace(",", ".");
      data.totalAmount = parseFloat(cleanVal) || 0.0;
    } else if (title.indexOf("comprovante") !== -1 || title.indexOf("pix") !== -1 || title.indexOf("upload") !== -1) {
      if (Array.isArray(response) && response.length > 0) {
        data.receiptUrl = "https://drive.google.com/open?id=" + response[0];
      } else {
        data.receiptUrl = String(response);
      }
    } else if (title.indexOf("observa") !== -1 || title.indexOf("nota") !== -1 || title.indexOf("coment") !== -1) {
      data.notes = response;
    }
  }

  // URL do webhook fornecida pelo ATEEL Products Hub
  var url = "${webhookUrl}";
  var secret = "${webhookSecret}";
  
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-webhook-secret": secret
    },
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log("Resposta do ATEEL Hub: " + response.getContentText());
  } catch (err) {
    Logger.log("Erro de conexão: " + err.toString());
  }
}`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-xs text-zinc-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/30 shrink-0">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-sm text-white">Integração com Google Forms</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Importe pedidos de formulários externos de forma 100% automatizada</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-900 bg-zinc-900/20 p-1 shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 text-center font-semibold text-[11px] rounded-lg transition ${activeTab === 'info' ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            1. Dados de Acesso
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 py-2 text-center font-semibold text-[11px] rounded-lg transition ${activeTab === 'script' ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            2. Script do Forms
          </button>
          <button
            onClick={() => setActiveTab('trigger')}
            className={`flex-1 py-2 text-center font-semibold text-[11px] rounded-lg transition ${activeTab === 'trigger' ? 'bg-primary text-primary-foreground font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            3. Criar Acionador
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Tab 1: Access credentials */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-bold text-[10px] uppercase tracking-wider">Webhook Endpoint Ativo</span>
                </div>
                <span className="text-[10px] text-zinc-400">Pronto para receber conexões</span>
              </div>

              <div className="space-y-3">
                {/* Webhook URL Field */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">URL de Destino (Webhook)</label>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-300">
                    <span className="flex-1 truncate select-all">{webhookUrl}</span>
                    <button
                      onClick={() => copyToClipboard(webhookUrl, setCopiedWebhook)}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition shrink-0"
                      title="Copiar URL"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-1">Essa é a URL de callback que deve ser inserida no script do Google Forms.</p>
                </div>

                {/* Secret Key Field */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Chave Secreta (x-webhook-secret)</label>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-2 font-mono text-zinc-300">
                    <span className="flex-1 truncate select-all">{webhookSecret}</span>
                    <button
                      onClick={() => copyToClipboard(webhookSecret, setCopiedSecret)}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition shrink-0"
                      title="Copiar Chave Secreta"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-1">Garante que apenas o seu formulário consiga submeter dados ao ATEEL Hub.</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Regras de nomenclatura das perguntas:
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Para que o script identifique as informações corretas automaticamente, garanta que seu Formulário do Google tenha perguntas contendo os seguintes termos:
                </p>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 pl-1">
                  <li><strong className="text-zinc-200">Nome</strong> (ex: "Nome Completo")</li>
                  <li><strong className="text-zinc-200">WhatsApp</strong> ou <strong className="text-zinc-200">Telefone</strong></li>
                  <li><strong className="text-zinc-200">Email</strong> ou <strong className="text-zinc-200">E-mail</strong></li>
                  <li><strong className="text-zinc-200">Produto</strong> ou <strong className="text-zinc-200">Kit</strong> (ex: "Escolha o Combo", "Produto Desejado")</li>
                  <li><strong className="text-zinc-200">Tamanho</strong> (ex: "Qual o seu tamanho?")</li>
                  <li><strong className="text-zinc-200">Comprovante</strong> ou <strong className="text-zinc-200">Pix</strong> (Pergunta do tipo Upload de Arquivo)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Code script */}
          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Código Apps Script do Google Forms</span>
                <button
                  onClick={() => copyToClipboard(appsScriptCode, setCopiedScript)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition shadow"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Script Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Script Completo</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg max-h-72 overflow-y-auto">
                <pre className="font-mono text-[10px] text-zinc-300 whitespace-pre leading-relaxed select-all">
                  {appsScriptCode}
                </pre>
              </div>

              <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-lg flex gap-2">
                <Code className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-bold text-white">Como colar este código:</h5>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    No painel de edição do seu Google Forms, clique nos três pontos (canto superior direito) &gt; <strong className="text-zinc-200">Editor de script</strong>. Apague todo o conteúdo do arquivo `Código.gs`, cole o script acima e clique em salvar (ícone de disquete).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Create Trigger */}
          {activeTab === 'trigger' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Play className="w-4 h-4 text-primary" />
                Ativação em tempo real por Acionadores
              </h4>

              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Para fazer o Google Forms disparar os dados automaticamente ao ATEEL Hub a cada novo pedido, você precisa configurar um acionador de envio no Apps Script:
              </p>

              <div className="space-y-3 font-medium text-zinc-300">
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-primary shrink-0 mt-0.5">1</span>
                  <p className="text-[11px]">
                    No editor do Apps Script, clique no ícone de relógio no menu lateral esquerdo (<strong className="text-zinc-100">Acionadores / Triggers</strong>).
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-primary shrink-0 mt-0.5">2</span>
                  <p className="text-[11px]">
                    Clique em <strong className="text-zinc-100">+ Adicionar Acionador</strong> no canto inferior direito.
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-primary shrink-0 mt-0.5">3</span>
                  <p className="text-[11px]">
                    Selecione as opções:
                    <br />
                    • Escolha qual função executar: <strong className="text-primary font-mono font-bold">onFormSubmit</strong>
                    <br />
                    • Selecione a origem do evento: <strong className="text-zinc-200 font-bold">Do formulário (From form)</strong>
                    <br />
                    • Selecione o tipo de evento: <strong className="text-zinc-200 font-bold">Ao enviar formulário (On form submit)</strong>
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-primary shrink-0 mt-0.5">4</span>
                  <p className="text-[11px]">
                    Clique em salvar, autorize as permissões da sua conta do Google e pronto! Os pedidos entrarão automaticamente.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-2 text-[11px] text-zinc-400">
                <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                <span>Integração 100% pronta. Novos formulários submetidos aparecerão na lista de pedidos em tempo real.</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition font-semibold"
          >
            Fechar Guia
          </button>
        </div>

      </div>
    </div>
  );
}
