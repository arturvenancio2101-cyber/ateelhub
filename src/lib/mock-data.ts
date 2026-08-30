import { Product, Idea, ExecutiveMetrics, Category, Supplier, ProductQuote, Kit, Order, IdeaVote } from '@/types/plm';

export const INITIAL_IDEAS: Idea[] = [
  {
    id: 'idea-1',
    title: 'Bucket Hat dupla face (Amarelo e Preto)',
    description: 'Bucket Hat universitário dupla face: um lado em preto liso com patch bordado do Tigre e o outro lado estampado em amarelo rotativo.',
    category: 'Outro',
    imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d435353?auto=format&fit=crop&q=80&w=200',
    votesCount: 24,
    createdBy: 'Diretora Júlia (Marketing)',
    status: 'Em Análise',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'idea-2',
    title: 'Jersey Oficial de Jogos 2026 com Garras',
    description: 'Nova estampa da Jersey oficial com grafismo de garras rasgando a lateral e tecido dry-fit tecnológico perfurado nas costas.',
    category: 'Jersey',
    imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=200',
    votesCount: 45,
    createdBy: 'Diretor Pedro (Esportes)',
    status: 'Aprovada',
    productId: 'prod-jsy-2026',
    createdAt: '2026-08-02T14:30:00Z',
    updatedAt: '2026-08-10T16:00:00Z'
  },
  {
    id: 'idea-3',
    title: 'Meia de Cano Alto com estampa de Tigre nas costas',
    description: 'Meia atoalhada de basquete/skate preta com listras amarelas e o Tigre da ATEEL bordado na panturrilha.',
    category: 'Meia',
    imageUrl: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=200',
    votesCount: 18,
    createdBy: 'Diretor Lucas (Produtos)',
    status: 'Em Análise',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'idea-4',
    title: 'Moletom Canguru Premium Bordado ATEEL',
    description: 'Moletom canguru super encorpado com capuz forrado em amarelo, cordão personalizado e logo ATEEL bordado em alta definição.',
    category: 'Moletom',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=200',
    votesCount: 39,
    createdBy: 'Diretora Júlia (Marketing)',
    status: 'Aprovada',
    productId: 'prod-mol-premium',
    createdAt: '2026-08-16T11:00:00Z',
    updatedAt: '2026-08-20T14:00:00Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-jsy-2026',
    name: 'Jersey Oficial de Jogos ATEEL 2026',
    slug: 'jersey-oficial-de-jogos-ateel-2026',
    sku: 'ATL-JSY-26',
    category: 'Jersey',
    status: 'Pré-Venda',
    description: 'Jersey de jogos oficial da Atlética, modelagem dry-fit esportiva, estampa personalizada sublimada com nome e número opcionais.',
    coverImageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400'],
    fabricType: 'Dry-fit Dry-Tec Premium',
    printTechnique: 'Sublimação Total Digital',
    supplierName: 'Sul Sport Uniformes',
    supplierLeadTimeDays: 25,
    targetDeliveryDate: '2026-10-15',
    costPrice: 42.00,
    memberPrice: 75.00,
    nonMemberPrice: 95.00,
    createdAt: '2026-08-10T16:00:00Z',
    updatedAt: '2026-08-25T11:00:00Z',
    sizes: [
      { id: 'sz-1', productId: 'prod-jsy-2026', sizeName: 'PP', quantityPreOrder: 5, quantityStock: 0, createdAt: '2026-08-10', updatedAt: '2026-08-10' },
      { id: 'sz-2', productId: 'prod-jsy-2026', sizeName: 'P', quantityPreOrder: 15, quantityStock: 0, createdAt: '2026-08-10', updatedAt: '2026-08-10' },
      { id: 'sz-3', productId: 'prod-jsy-2026', sizeName: 'M', quantityPreOrder: 32, quantityStock: 0, createdAt: '2026-08-10', updatedAt: '2026-08-10' },
      { id: 'sz-4', productId: 'prod-jsy-2026', sizeName: 'G', quantityPreOrder: 22, quantityStock: 0, createdAt: '2026-08-10', updatedAt: '2026-08-10' },
      { id: 'sz-5', productId: 'prod-jsy-2026', sizeName: 'GG', quantityPreOrder: 8, quantityStock: 0, createdAt: '2026-08-10', updatedAt: '2026-08-10' }
    ]
  },
  {
    id: 'prod-sbc-tigrao',
    name: 'Samba-canção Tigrão ATEEL',
    slug: 'samba-cancao-tigrao-ateel',
    sku: 'ATL-SBC-01',
    category: 'Samba-canção',
    status: 'Estoque',
    description: 'Samba-canção clássico em cetim super leve com estampa rotativa do Tigre da ATEEL e elástico embutido de alta durabilidade.',
    coverImageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=400'],
    fabricType: 'Cetim de Poliéster Premium',
    printTechnique: 'Sublimação Rotativa',
    supplierName: 'Estamparia Floripa Confecções',
    supplierLeadTimeDays: 20,
    targetDeliveryDate: '2026-05-10',
    costPrice: 22.00,
    memberPrice: 35.00,
    nonMemberPrice: 45.00,
    createdAt: '2026-04-15T09:00:00Z',
    updatedAt: '2026-08-28T09:00:00Z',
    sizes: [
      { id: 'sz-6', productId: 'prod-sbc-tigrao', sizeName: 'PP', quantityPreOrder: 0, quantityStock: 10, createdAt: '2026-04-15', updatedAt: '2026-08-28' },
      { id: 'sz-7', productId: 'prod-sbc-tigrao', sizeName: 'P', quantityPreOrder: 0, quantityStock: 25, createdAt: '2026-04-15', updatedAt: '2026-08-28' },
      { id: 'sz-8', productId: 'prod-sbc-tigrao', sizeName: 'M', quantityPreOrder: 0, quantityStock: 40, createdAt: '2026-04-15', updatedAt: '2026-08-28' },
      { id: 'sz-9', productId: 'prod-sbc-tigrao', sizeName: 'G', quantityPreOrder: 0, quantityStock: 15, createdAt: '2026-04-15', updatedAt: '2026-08-28' }
    ]
  },
  {
    id: 'prod-tir-40mm',
    name: 'Tirante Oficial ATEEL 40mm',
    slug: 'tirante-oficial-ateel-40mm',
    sku: 'ATL-TIR-01',
    category: 'Tirante',
    status: 'Estoque',
    description: 'Tirante largo de 40mm acetinado, mosquetão de metal reforçado e estampa dupla face com garras e logo ATEEL UFSC.',
    coverImageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=400',
    fabricType: 'Fita Poliéster Acetinada 40mm',
    printTechnique: 'Sublimação Dupla Face',
    supplierName: 'Rei dos Cordões',
    supplierLeadTimeDays: 12,
    targetDeliveryDate: '2026-06-01',
    costPrice: 4.50,
    memberPrice: 10.00,
    nonMemberPrice: 15.00,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-08-28T10:00:00Z',
    sizes: [
      { id: 'sz-10', productId: 'prod-tir-40mm', sizeName: 'ÚNICO', quantityPreOrder: 80, quantityStock: 220, createdAt: '2026-05-01', updatedAt: '2026-08-28' }
    ]
  },
  {
    id: 'prod-can-850ml',
    name: 'Caneca de Alumínio Tirante Combo 850ml',
    slug: 'caneca-de-aluminio-tirante-combo-850ml',
    sku: 'ATL-CAN-850',
    category: 'Caneca',
    status: 'Cotação',
    description: 'Caneca de alumínio escovado com capacidade de 850ml com pintura eletrostática preta fosca e tirante incluso.',
    coverImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
    fabricType: 'Alumínio 1.2mm Pintado',
    printTechnique: 'Gravação a Laser Frente/Verso',
    supplierName: 'Alumínio Central Cias',
    supplierLeadTimeDays: 15,
    targetDeliveryDate: '2026-11-01',
    costPrice: 14.00,
    memberPrice: 28.00,
    nonMemberPrice: 38.00,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-28T14:00:00Z',
    sizes: [
      { id: 'sz-11', productId: 'prod-can-850ml', sizeName: 'ÚNICO', quantityPreOrder: 0, quantityStock: 0, createdAt: '2026-08-20', updatedAt: '2026-08-28' }
    ]
  }
];

// Novos dados simulados para Módulo de Fornecedores, Categorias Dinâmicas e Cotações
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Camiseta', description: 'Camisetas em algodão penteado 30.1 ou dry-fit esportivo.', createdAt: '2026-08-28T00:00:00Z' },
  { id: 'cat-2', name: 'Samba-canção', description: 'Samba-canção em cetim com elastano e estampas rotativas.', createdAt: '2026-08-28T00:00:00Z' },
  { id: 'cat-3', name: 'Jersey', description: 'Jerseys de jogos oficiais sublimadas de alta performance.', createdAt: '2026-08-28T00:00:00Z' },
  { id: 'cat-4', name: 'Tirante', description: 'Tirantes sublimados dupla face de 40mm.', createdAt: '2026-08-28T00:00:00Z' },
  { id: 'cat-5', name: 'Caneca', description: 'Canecas de alumínio ou tirantes de silicone.', createdAt: '2026-08-28T00:00:00Z' },
  { id: 'cat-6', name: 'Moletom', description: 'Moletons pesados estilo colegial.', createdAt: '2026-08-28T00:00:00Z' }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Estampa Sul Esportes',
    contactName: 'Carlos Souza',
    phone: '5547999887766',
    email: 'comercial@estampasul.com.br',
    cityState: 'Brusque/SC',
    pixKey: 'comercial@estampasul.com.br',
    paymentTerms: '50% entrada + 50% entrega',
    rating: 5,
    notes: 'Excelente parceiro de Jerseys e dry-fit. Atendimento rápido por WhatsApp.',
    createdAt: '2026-08-28T00:00:00Z',
    updatedAt: '2026-08-28T00:00:00Z'
  },
  {
    id: 'sup-2',
    name: 'Norte Confecções SC',
    contactName: 'Juliana Mendes',
    phone: '5547988776655',
    email: 'financeiro@norteconfeccoes.com.br',
    cityState: 'Blumenau/SC',
    pixKey: '12.345.678/0001-99',
    paymentTerms: '30 dias boleto bancário',
    rating: 4,
    notes: 'Confecção de moletons pesados e samba-canção. Ótima qualidade de costura.',
    createdAt: '2026-08-28T00:00:00Z',
    updatedAt: '2026-08-28T00:00:00Z'
  },
  {
    id: 'sup-3',
    name: 'Brindes Floripa',
    contactName: 'Marcos Lima',
    phone: '5548987654321',
    email: 'marcos@brindesfloripa.com',
    cityState: 'Florianópolis/SC',
    pixKey: '48987654321',
    paymentTerms: 'À vista via Pix no faturamento',
    rating: 5,
    notes: 'Fornecedor oficial de tirantes e canecas personalizadas.',
    createdAt: '2026-08-28T00:00:00Z',
    updatedAt: '2026-08-28T00:00:00Z'
  }
];

export const INITIAL_QUOTES: ProductQuote[] = [
  {
    id: 'q-1',
    productName: 'Jersey Oficial 2026 ATEEL',
    categoryId: 'cat-3',
    supplierId: 'sup-1',
    unitCost: 42.00,
    minQuantity: 50,
    leadTimeDays: 20,
    materialSpecs: 'Dry-Tec UV50+ ventilado',
    printTechnique: 'Sublimação total digital HD',
    status: 'APROVADO',
    notes: 'Custo especial garantido para o primeiro lote de jogos.',
    createdAt: '2026-08-28T00:00:00Z',
    updatedAt: '2026-08-28T00:00:00Z'
  },
  {
    id: 'q-2',
    productName: 'Samba-canção Mascote Classic',
    categoryId: 'cat-2',
    supplierId: 'sup-2',
    unitCost: 18.00,
    minQuantity: 100,
    leadTimeDays: 15,
    materialSpecs: 'Cetim Toque de Seda com elastano',
    printTechnique: 'Sublimação corrida total',
    status: 'APROVADO',
    notes: 'Pedido inicial agendado para entrega antes da pré-venda.',
    createdAt: '2026-08-28T00:00:00Z',
    updatedAt: '2026-08-28T00:00:00Z'
  },
  {
    id: 'q-3',
    productName: 'Combo Tirante 40mm com Mosquetão',
    categoryId: 'cat-4',
    supplierId: 'sup-3',
    unitCost: 4.50,
    minQuantity: 150,
    leadTimeDays: 10,
    materialSpecs: 'Poliéster Acetinado largo',
    printTechnique: 'Sublimação Frente e Verso',
    status: 'EM_ANALISE',
    notes: 'Verificar se o valor unitário reduz em lotes acima de 500 unidades.',
    createdAt: '2026-08-28T00:00:00Z',
    updatedAt: '2026-08-28T00:00:00Z'
  }
];

export function getExecutiveMetrics(products: Product[], ideas: Idea[]): ExecutiveMetrics {
  const totalActiveProducts = products.filter(p => p.status !== 'Encerrado').length;
  const totalIdeas = ideas.length;

  let totalPreOrders = 0;
  let totalStockQty = 0;
  let totalCostPrice = 0;
  let totalEstimatedRevenue = 0;

  products.forEach(p => {
    let productPreOrders = 0;
    let productStock = 0;
    
    if (p.sizes) {
      p.sizes.forEach(sz => {
        productPreOrders += sz.quantityPreOrder;
        productStock += sz.quantityStock;
      });
    }

    totalPreOrders += productPreOrders;
    totalStockQty += productStock;
    totalCostPrice += p.costPrice * (productPreOrders + productStock);
    
    // Projeção: consideramos 85% de vendas para sócios e 15% para não-sócios
    const avgMemberPrice = p.memberPrice * 0.85 + p.nonMemberPrice * 0.15;
    totalEstimatedRevenue += avgMemberPrice * (productPreOrders + productStock);
  });

  const catMap: Record<string, number> = {};
  const phaseMap: Record<string, number> = {};

  products.forEach(p => {
    catMap[p.category] = (catMap[p.category] || 0) + 1;
    phaseMap[p.status] = (phaseMap[p.status] || 0) + 1;
  });

  const categoryDistribution = Object.entries(catMap).map(([category, count]) => ({ category, count }));
  const phaseDistribution = Object.entries(phaseMap).map(([phase, count]) => ({ phase, count }));

  return {
    totalActiveProducts,
    totalIdeas,
    totalPreOrders,
    totalStockQty,
    totalCostPrice,
    totalEstimatedRevenue,
    categoryDistribution,
    phaseDistribution
  };
}

export const INITIAL_KITS: Kit[] = [
  {
    id: 'kit-1',
    name: 'Kit Calouro Premium ATEEL',
    description: 'O combo essencial para começar a faculdade no estilo do Tigrão! Contém: 1x Camiseta/Jersey Oficial, 1x Tirante 40mm e 1x Caneca de Alumínio.',
    imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=400',
    memberPrice: 95.00,
    nonMemberPrice: 120.00,
    items: [
      { id: 'ki-1', kitId: 'kit-1', productId: 'prod-jsy-2026', quantity: 1 },
      { id: 'ki-2', kitId: 'kit-1', productId: 'prod-tir-40mm', quantity: 1 }
    ],
    createdAt: '2026-08-28T00:00:00Z'
  },
  {
    id: 'kit-2',
    name: 'Kit Atleta de Elite',
    description: 'Para quem representa a ATEEL nas quadras e nos campos. Contém: 1x Jersey Oficial Gold e 1x Samba-canção Tigrão Classic.',
    imageUrl: 'https://images.unsplash.com/photo-1515658351347-70df6b8e68cd?auto=format&fit=crop&q=80&w=400',
    memberPrice: 100.00,
    nonMemberPrice: 125.00,
    items: [
      { id: 'ki-3', kitId: 'kit-2', productId: 'prod-jsy-2026', quantity: 1 },
      { id: 'ki-4', kitId: 'kit-2', productId: 'prod-sbc-tigrao', quantity: 1 }
    ],
    createdAt: '2026-08-28T00:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    customerName: 'Artur Venâncio',
    customerPhone: '5548999998888',
    customerEmail: 'artur@eng.ufsc.br',
    totalAmount: 165.00,
    paymentStatus: 'PAGO',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600',
    notes: 'Retirada no Centro Tecnológico (CTC)',
    items: [
      {
        id: 'oi-1',
        orderId: 'ord-1',
        kitId: 'kit-1',
        unitPrice: 95.00,
        quantity: 1
      },
      {
        id: 'oi-2',
        orderId: 'ord-1',
        productId: 'prod-sbc-tigrao',
        unitPrice: 35.00,
        quantity: 2,
        size: 'G'
      }
    ],
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-08-28T10:15:00Z'
  },
  {
    id: 'ord-2',
    customerName: 'Beatriz Silveira',
    customerPhone: '5548988887777',
    customerEmail: 'beatriz@ufsc.br',
    totalAmount: 100.00,
    paymentStatus: 'AGUARDANDO_VALIDACAO',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600',
    notes: 'Entregar para o pessoal da diretoria comercial',
    items: [
      {
        id: 'oi-3',
        orderId: 'ord-2',
        kitId: 'kit-2',
        unitPrice: 100.00,
        quantity: 1,
        size: 'P'
      }
    ],
    createdAt: '2026-08-28T11:30:00Z',
    updatedAt: '2026-08-28T11:30:00Z'
  },
  {
    id: 'ord-3',
    customerName: 'Caio Medeiros',
    customerPhone: '5547977776666',
    customerEmail: 'caio@gmail.com',
    totalAmount: 10.00,
    paymentStatus: 'PENDENTE',
    receiptUrl: null,
    notes: 'Aguardando o envio do comprovante Pix',
    items: [
      {
        id: 'oi-4',
        orderId: 'ord-3',
        productId: 'prod-tir-40mm',
        unitPrice: 10.00,
        quantity: 1,
        size: 'ÚNICO'
      }
    ],
    createdAt: '2026-08-28T12:00:00Z',
    updatedAt: '2026-08-28T12:00:00Z'
  }
];

export const INITIAL_VOTES: IdeaVote[] = [
  {
    id: 'vote-1',
    ideaId: 'idea-1',
    voterName: 'Jéssica Ramos',
    voterPhone: '5548991234567',
    intendsToBuy: true,
    preferredSize: 'M',
    createdAt: '2026-08-28T14:00:00Z'
  },
  {
    id: 'vote-2',
    ideaId: 'idea-1',
    voterName: 'Guilherme Schmidt',
    voterPhone: '5548998765432',
    intendsToBuy: true,
    preferredSize: 'GG',
    createdAt: '2026-08-28T14:30:00Z'
  },
  {
    id: 'vote-3',
    ideaId: 'idea-1',
    voterName: 'Mariana Costa',
    voterPhone: '5548991112222',
    intendsToBuy: false,
    preferredSize: 'P',
    createdAt: '2026-08-28T15:00:00Z'
  }
];

