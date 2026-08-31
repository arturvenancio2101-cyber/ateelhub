<div align="center">

# ⚡ ATEEL Products Hub

**Plataforma de Gestão de Ciclo de Vida de Produtos, Cotações e Integração de Pedidos**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

[🌐 Acessar Plataforma Online](https://ateelhub.vercel.app) • [📦 Reportar Bug](https://github.com/arturvenancio2101-cyber/ateelhub/issues)

</div>

---

## 📌 Sobre o Projeto

O **ATEEL Products Hub** é uma solução completa desenvolvida para modernizar, automatizar e centralizar a gestão de produtos, pré-vendas e finanças da **ATEEL**.

A plataforma conecta desde o brainstorming inicial de novos produtos até a entrega física aos estudantes, unificando a esteira de cotação de fornecedores, controle de ponto de equilíbrio financeiro (*Break-Even*), estoque e baixa de retiradas com auditoria.

---

## 🚀 Principais Módulos

* **📋 Kanban de Desenvolvimento & Sprint Semanal:** Acompanhamento do ciclo de vida dos produtos (Ideia → Design → Cotação → Pré-Venda → Produção → Retirada).
* **🔍 Cotação & Homologação de Fornecedores:** Comparativo lado a lado de preço unitário, frete, prazos (*lead time*), MOQ e notas de qualidade de amostras.
* **📦 Pedidos & Break-Even Financeiro:** Rastreio de pedidos em tempo real integrados via Google Forms com validação de comprovantes Pix e cálculo de viabilidade de lote.
* **🏷️ Catálogo & Estoque com Grade:** Gestão de variações de tamanhos (PP ao GG), saldo em estoque e alertas de reposição.
* **🤝 Controle de Retiradas:** Registro com data, hora, responsável pela entrega e nome do aluno que retirou.
* **🔐 Autenticação com Controle de Acesso (RBAC):** Níveis de permissão diferenciados para Administradores (`ADMIN`) e Membros Operacionais (`USER`).

---

## 🛠️ Tecnologias Utilizadas

* **Frontend & Backend:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (Ícones)
* **Banco de Dados & ORM:** [PostgreSQL via Supabase](https://supabase.com/) com [Prisma ORM](https://www.prisma.io/)
* **Autenticação:** [NextAuth.js](https://next-auth.js.org/)
* **Hospedagem & CI/CD:** [Vercel](https://vercel.com/)

---

## ⚙️ Configuração do Ambiente Local

### 1. Clonar o repositório
```bash
git clone https://github.com/arturvenancio2101-cyber/ateelhub.git
cd ateelhub
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://postgres.[ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="seu-segredo-de-autenticacao"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Sincronizar o banco de dados
```bash
npx prisma db push
```

### 5. Executar o servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 👥 Permissões de Acesso

| Perfil | Acesso |
| :--- | :--- |
| 👑 **ADMIN** | Acesso irrestrito a configurações, cadastro de cotações, edição de estoque, métricas financeiras e gestão de usuários. |
| 👤 **USER** | Visualização de pedidos, baixa de retiradas, consulta ao catálogo e movimentação do Kanban. |

---

<div align="center">
  Desenvolvido com 💙 para a <b>ATEEL</b>
</div>
