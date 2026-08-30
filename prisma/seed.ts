import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados ATEEL Products Hub...');

  // Limpando dados antigos em ordem de chave estrangeira
  await prisma.productSize.deleteMany();
  await prisma.productQuote.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();

  // 1. Criando Categorias Dinâmicas
  console.log('Semeando categorias...');
  const catCamiseta = await prisma.category.create({
    data: { name: 'Camiseta', description: 'Camisetas em algodão penteado 30.1 ou dry-fit esportivo.' }
  });
  const catSamba = await prisma.category.create({
    data: { name: 'Samba-canção', description: 'Samba-canção em cetim com elastano e estampas rotativas.' }
  });
  const catJersey = await prisma.category.create({
    data: { name: 'Jersey', description: 'Jerseys de jogos oficiais sublimadas de alta performance.' }
  });
  const catTirante = await prisma.category.create({
    data: { name: 'Tirante', description: 'Tirantes sublimados dupla face de 40mm.' }
  });
  const catCaneca = await prisma.category.create({
    data: { name: 'Caneca', description: 'Canecas de alumínio ou acrílico com tirantes de silicone.' }
  });
  const catMoletom = await prisma.category.create({
    data: { name: 'Moletom', description: 'Moletons pesados estilo colegial.' }
  });

  // 2. Criando Fornecedores
  console.log('Semeando fornecedores...');
  const sup1 = await prisma.supplier.create({
    data: {
      name: 'Estampa Sul Esportes',
      contactName: 'Carlos Souza',
      phone: '5547999887766',
      email: 'comercial@estampasul.com.br',
      cityState: 'Brusque/SC',
      pixKey: 'comercial@estampasul.com.br',
      paymentTerms: '50% entrada + 50% entrega',
      rating: 5,
      notes: 'Excelente parceiro de Jerseys e dry-fit. Atendimento rápido por WhatsApp.'
    }
  });

  const sup2 = await prisma.supplier.create({
    data: {
      name: 'Norte Confecções SC',
      contactName: 'Juliana Mendes',
      phone: '5547988776655',
      email: 'financeiro@norteconfeccoes.com.br',
      cityState: 'Blumenau/SC',
      pixKey: '12.345.678/0001-99',
      paymentTerms: '30 dias boleto bancário',
      rating: 4,
      notes: 'Confecção de moletons pesados e samba-canção. Ótima qualidade de costura.'
    }
  });

  const sup3 = await prisma.supplier.create({
    data: {
      name: 'Brindes Floripa',
      contactName: 'Marcos Lima',
      phone: '5548987654321',
      email: 'marcos@brindesfloripa.com',
      cityState: 'Florianópolis/SC',
      pixKey: '48987654321',
      paymentTerms: 'À vista via Pix no faturamento',
      rating: 5,
      notes: 'Fornecedor oficial de tirantes e canecas personalizadas.'
    }
  });

  // 3. Criando Cotações de Produtos (Product Quotes)
  console.log('Semeando cotações...');
  await prisma.productQuote.createMany({
    data: [
      {
        productName: 'Jersey Oficial 2026 ATEEL',
        categoryId: catJersey.id,
        supplierId: sup1.id,
        unitCost: 42.00,
        minQuantity: 50,
        leadTimeDays: 20,
        materialSpecs: 'Dry-Tec UV50+ ventilado',
        printTechnique: 'Sublimação total digital HD',
        status: 'APROVADO',
        notes: 'Custo especial garantido para o primeiro lote de jogos.'
      },
      {
        productName: 'Samba-canção Mascote Classic',
        categoryId: catSamba.id,
        supplierId: sup2.id,
        unitCost: 18.00,
        minQuantity: 100,
        leadTimeDays: 15,
        materialSpecs: 'Cetim Toque de Seda com elastano',
        printTechnique: 'Sublimação corrida total',
        status: 'APROVADO',
        notes: 'Pedido inicial agendado para entrega antes da pré-venda.'
      },
      {
        productName: 'Combo Tirante 40mm com Mosquetão',
        categoryId: catTirante.id,
        supplierId: sup3.id,
        unitCost: 4.50,
        minQuantity: 150,
        leadTimeDays: 10,
        materialSpecs: 'Poliéster Acetinado largo',
        printTechnique: 'Sublimação Frente e Verso',
        status: 'EM_ANALISE',
        notes: 'Verificar se o valor unitário reduz em lotes acima de 500 unidades.'
      }
    ]
  });

  // 4. Seed de Ideias (Brainstorming Mural)
  console.log('Semeando ideias...');
  await prisma.idea.createMany({
    data: [
      {
        title: 'Bucket Hat Dupla Face Preto e Amarelo',
        category: 'Outro',
        description: 'Um bucket hat dupla face. De um lado preto liso com logo bordado, do outro estampa sublimada amarela do Tigrão.',
        imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d435353?auto=format&fit=crop&q=80&w=300',
        votesCount: 42,
        status: 'Ideacao',
        createdBy: 'Júlia (Diretora Mkt)'
      },
      {
        title: 'Moletom Canguru Premium com Capuz',
        category: 'Moletom',
        description: 'Moletom pesado com capuz ajustável e bordado grande "ATEEL UFSC" no peito. Cores oficiais preta e amarela.',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=300',
        votesCount: 89,
        status: 'Aprovada',
        createdBy: 'Lucas (Presidente)'
      },
      {
        title: 'Meia Cano Alto Sublimada Tigrão',
        category: 'Meia',
        description: 'Meia estilo americana com listras amarelas e o Tigrão estampado na lateral.',
        imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=300',
        votesCount: 15,
        status: 'Ideacao',
        createdBy: 'Bernardo (Diretor Comercial)'
      }
    ]
  });

  // 5. Seed de Produtos Reais no Pipeline de Confecção
  console.log('Semeando produtos...');
  
  // Produto 1: Jersey Oficial
  const p1 = await prisma.product.create({
    data: {
      sku: 'ATL-JRS-2026',
      slug: 'jersey-oficial-ateel-edicao-gold',
      name: 'Jersey Oficial ATEEL - Edição Gold',
      category: 'Jersey',
      description: 'Camisa esportiva oficial da atlética confeccionada em dry-fit de alta performance com proteção UV e detalhes sublimados em dourado/amarelo ATEEL.',
      status: 'Pré-Venda',
      fabricType: 'Dry-fit Dry-Tec UV50+',
      printTechnique: 'Sublimação Total Digital',
      costPrice: 42.00,
      memberPrice: 75.00,
      nonMemberPrice: 90.00,
      coverImageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
      supplierName: 'Estampa Sul Esportes',
      supplierLeadTimeDays: 20,
      targetDeliveryDate: new Date('2026-10-15'),
      categoryId: catJersey.id
    }
  });

  // Grade de tamanho para Jersey
  await prisma.productSize.createMany({
    data: [
      { productId: p1.id, sizeName: 'P', quantityPreOrder: 15, quantityStock: 5 },
      { productId: p1.id, sizeName: 'M', quantityPreOrder: 32, quantityStock: 10 },
      { productId: p1.id, sizeName: 'G', quantityPreOrder: 25, quantityStock: 10 },
      { productId: p1.id, sizeName: 'GG', quantityPreOrder: 12, quantityStock: 5 },
      { productId: p1.id, sizeName: 'XGG', quantityPreOrder: 5, quantityStock: 2 }
    ]
  });

  // Produto 2: Samba-canção
  const p2 = await prisma.product.create({
    data: {
      sku: 'ATL-SAM-CL',
      slug: 'samba-cancao-tigrao-classic',
      name: 'Samba-canção Tigrão Classic',
      category: 'Samba-canção',
      description: 'Samba-canção clássico em cetim com elástico reforçado no cós e estampa corrida das mascotes do Tigrão.',
      status: 'Em Produção',
      fabricType: 'Cetim Toque de Seda',
      printTechnique: 'Sublimação Corrida Rotativa',
      costPrice: 18.00,
      memberPrice: 35.00,
      nonMemberPrice: 45.00,
      coverImageUrl: 'https://images.unsplash.com/photo-1590246814883-57c511e76523?auto=format&fit=crop&q=80&w=400',
      supplierName: 'Norte Confecções SC',
      supplierLeadTimeDays: 15,
      targetDeliveryDate: new Date('2026-09-25'),
      categoryId: catSamba.id
    }
  });

  // Grade de tamanho para Samba-canção
  await prisma.productSize.createMany({
    data: [
      { productId: p2.id, sizeName: 'P', quantityPreOrder: 20, quantityStock: 0 },
      { productId: p2.id, sizeName: 'M', quantityPreOrder: 45, quantityStock: 0 },
      { productId: p2.id, sizeName: 'G', quantityPreOrder: 40, quantityStock: 0 },
      { productId: p2.id, sizeName: 'GG', quantityPreOrder: 15, quantityStock: 0 },
      { productId: p2.id, sizeName: 'XGG', quantityPreOrder: 8, quantityStock: 0 }
    ]
  });

  // Produto 3: Tirante
  const p3 = await prisma.product.create({
    data: {
      sku: 'ATL-TIR-4CM',
      slug: 'tirante-oficial-ateel-40mm',
      name: 'Tirante Oficial ATEEL 40mm',
      category: 'Tirante',
      description: 'Tirante largo de 40mm de espessura com mosquetão metálico reforçado e engate rápido de silicone.',
      status: 'Estoque',
      fabricType: 'Poliéster Acetinado Reforçado',
      printTechnique: 'Sublimação Dupla Face',
      costPrice: 5.50,
      memberPrice: 12.00,
      nonMemberPrice: 18.00,
      coverImageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=400',
      supplierName: 'Brindes Floripa',
      supplierLeadTimeDays: 10,
      targetDeliveryDate: new Date('2026-08-10'),
      categoryId: catTirante.id
    }
  });

  // Grade de tamanho para Tirante (Tamanho Único)
  await prisma.productSize.createMany({
    data: [
      { productId: p3.id, sizeName: 'ÚNICO', quantityPreOrder: 50, quantityStock: 120 }
    ]
  });

  console.log('Seed do ATEEL Products Hub concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
