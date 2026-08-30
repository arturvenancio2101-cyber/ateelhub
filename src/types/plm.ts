// Interfaces e Tipos estritos TypeScript para ATEEL Products Hub

export interface Idea {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  imageUrl?: string | null;
  votesCount: number;
  createdBy?: string | null;
  status: string; // 'Em Análise' | 'Aprovada' | 'Descartada'
  productId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSize {
  id: string;
  productId: string;
  sizeName: string; // PP, P, M, G, GG, XGG, ÚNICO
  quantityPreOrder: number;
  quantityStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string; // Categoria legada
  status: string; // Briefing, Design, Cotação, Pré-Venda, Em Produção, Estoque, Encerrado
  description?: string | null;
  coverImageUrl?: string | null;
  images?: any; // JSON array of mockup URLs
  fabricType?: string | null;
  printTechnique?: string | null;
  supplierName?: string | null;
  supplierLeadTimeDays: number;
  targetDeliveryDate?: string | null;
  costPrice: number;
  memberPrice: number;
  nonMemberPrice: number;
  createdAt: string;
  updatedAt: string;

  categoryId?: string | null;
  categoryRel?: Category | null;
  sizes?: ProductSize[];
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  cityState?: string | null;
  pixKey?: string | null;
  paymentTerms?: string | null;
  rating: number; // 1 a 5
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus = 'APROVADO' | 'EM_ANALISE' | 'RECUSADO';

export interface ProductQuote {
  id: string;
  productName: string;
  categoryId: string;
  category?: Category;
  supplierId: string;
  supplier?: Supplier;
  unitCost: number;
  minQuantity: number;
  leadTimeDays: number;
  materialSpecs?: string | null;
  printTechnique?: string | null;
  status: QuoteStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// DTOs para APIs
export interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  status?: string;
  description?: string;
  coverImageUrl?: string;
  fabricType?: string;
  printTechnique?: string;
  supplierName?: string;
  supplierLeadTimeDays?: number;
  targetDeliveryDate?: string;
  costPrice?: number;
  memberPrice?: number;
  nonMemberPrice?: number;
  categoryId?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface CreateIdeaInput {
  title: string;
  description?: string;
  category: string;
  imageUrl?: string;
  createdBy?: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface CreateSupplierInput {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  cityState?: string;
  pixKey?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
}

export interface CreateQuoteInput {
  productName: string;
  categoryId: string;
  supplierId: string;
  unitCost: number;
  minQuantity?: number;
  leadTimeDays: number;
  materialSpecs?: string;
  printTechnique?: string;
  status?: QuoteStatus;
  notes?: string;
}

export interface ExecutiveMetrics {
  totalActiveProducts: number;
  totalIdeas: number;
  totalPreOrders: number;
  totalStockQty: number;
  totalCostPrice: number;
  totalEstimatedRevenue: number;
  categoryDistribution: { category: string; count: number }[];
  phaseDistribution: { phase: string; count: number }[];
}

export interface KitItem {
  id: string;
  kitId: string;
  productId: string;
  product?: Product;
  quantity: number;
}

export interface Kit {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  memberPrice: number;
  nonMemberPrice: number;
  items?: KitItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  product?: Product | null;
  kitId?: string | null;
  kit?: Kit | null;
  size?: string | null; // PP, P, M, G, GG, Unico
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  totalAmount: number;
  paymentStatus: string; // PENDENTE, AGUARDANDO_VALIDACAO, PAGO
  receiptUrl?: string | null;
  notes?: string | null;
  
  deliveryStatus?: string;
  deliveredAt?: string | null;
  deliveredById?: string | null;
  pickedUpBy?: string | null;

  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IdeaVote {
  id: string;
  ideaId: string;
  voterName: string;
  voterPhone?: string | null;
  voterCourse?: string | null;
  intendsToBuy: boolean;
  preferredSize?: string | null;
  createdAt: string;
}

export interface CreateKitInput {
  name: string;
  description?: string;
  imageUrl?: string;
  memberPrice: number;
  nonMemberPrice: number;
  items: { productId: string; quantity: number }[];
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalAmount: number;
  paymentStatus?: string;
  receiptUrl?: string;
  notes?: string;
  items: {
    productId?: string | null;
    kitId?: string | null;
    size?: string | null;
    unitPrice: number;
    quantity: number;
  }[];
}

export interface CreateVoteInput {
  voterName: string;
  voterPhone?: string;
  voterCourse?: string;
  intendsToBuy?: boolean;
  preferredSize?: string;
}

