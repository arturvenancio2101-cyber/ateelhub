import { PrismaClient } from '@prisma/client';
import { 
  Product, 
  Idea, 
  CreateProductInput, 
  UpdateProductInput, 
  CreateIdeaInput, 
  Category, 
  Supplier, 
  ProductQuote, 
  CreateCategoryInput, 
  CreateSupplierInput, 
  CreateQuoteInput,
  Kit,
  KitItem,
  Order,
  OrderItem,
  IdeaVote,
  CreateKitInput,
  CreateOrderInput,
  CreateVoteInput
} from '@/types/plm';
// Remove import from mock-data to ensure we do not populate the DB with mock data

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let memoryProductsStore: Product[] = [];
let memoryIdeasStore: Idea[] = [];
let memoryCategoriesStore: Category[] = [];
let memorySuppliersStore: Supplier[] = [];
let memoryQuotesStore: ProductQuote[] = [];
let memoryKitsStore: Kit[] = [];
let memoryOrdersStore: Order[] = [];
let memoryVotesStore: IdeaVote[] = [];

export const ideaService = {
  async getAllIdeas(): Promise<Idea[]> {
    try {
      if (process.env.DATABASE_URL) {
        const dbIdeas = await prisma.idea.findMany({
          orderBy: { votesCount: 'desc' }
        });
        return dbIdeas as unknown as Idea[];
      }
    } catch (err) {
      console.warn('Prisma DB indisponível. Usando ideas em memória.');
    }
    return [...memoryIdeasStore].sort((a, b) => b.votesCount - a.votesCount);
  },

  async createIdea(input: CreateIdeaInput): Promise<Idea> {
    const newId = `idea-${Date.now()}`;
    const now = new Date().toISOString();
    const newIdea: Idea = {
      id: newId,
      title: input.title,
      description: input.description || '',
      category: input.category,
      imageUrl: input.imageUrl || null,
      votesCount: 0,
      createdBy: input.createdBy || 'Diretoria',
      status: 'Em Análise',
      createdAt: now,
      updatedAt: now
    };

    try {
      if (process.env.DATABASE_URL) {
        const dbIdea = await prisma.idea.create({
          data: {
            title: newIdea.title,
            description: newIdea.description,
            category: newIdea.category,
            imageUrl: newIdea.imageUrl,
            createdBy: newIdea.createdBy,
            status: newIdea.status
          }
        });
        return dbIdea as unknown as Idea;
      }
    } catch (err) {
      console.warn('Prisma createIdea fallback.');
    }

    memoryIdeasStore.unshift(newIdea);
    return newIdea;
  },

  async voteIdea(id: string): Promise<Idea | null> {
    try {
      if (process.env.DATABASE_URL) {
        const dbIdea = await prisma.idea.update({
          where: { id },
          data: { votesCount: { increment: 1 } }
        });
        return dbIdea as unknown as Idea;
      }
    } catch (err) {
      console.warn('Prisma voteIdea fallback.');
    }

    const index = memoryIdeasStore.findIndex(i => i.id === id);
    if (index !== -1) {
      memoryIdeasStore[index].votesCount += 1;
      return memoryIdeasStore[index];
    }
    return null;
  },

  async updateIdeaStatus(id: string, status: string, productId?: string): Promise<Idea | null> {
    try {
      if (process.env.DATABASE_URL) {
        const dbIdea = await prisma.idea.update({
          where: { id },
          data: { status, productId }
        });
        return dbIdea as unknown as Idea;
      }
    } catch (err) {
      console.warn('Prisma updateIdeaStatus fallback.');
    }

    const index = memoryIdeasStore.findIndex(i => i.id === id);
    if (index !== -1) {
      memoryIdeasStore[index].status = status;
      if (productId) memoryIdeasStore[index].productId = productId;
      return memoryIdeasStore[index];
    }
    return null;
  }
};

export const productService = {
  async getAllProducts(filters?: { category?: string; status?: string; search?: string }): Promise<Product[]> {
    try {
      if (process.env.DATABASE_URL) {
        const where: any = {};
        if (filters?.category) where.category = filters.category;
        if (filters?.status) where.status = filters.status;
        if (filters?.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { sku: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
          ];
        }

        const dbProducts = await prisma.product.findMany({
          where,
          include: { sizes: true, supplierQuotes: true },
          orderBy: { updatedAt: 'desc' }
        });

        return dbProducts as unknown as Product[];
      }
    } catch (err) {
      console.warn('Prisma DB indisponível. Usando produtos em memória.');
    }

    let result = [...memoryProductsStore];
    if (filters?.category) {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters?.status) {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return result;
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      if (process.env.DATABASE_URL) {
        const dbProduct = await prisma.product.findUnique({
          where: { id },
          include: { sizes: true, supplierQuotes: true }
        });
        if (dbProduct) return dbProduct as unknown as Product;
      }
    } catch (err) {
      console.warn('Prisma getProductById fallback.');
    }

    return memoryProductsStore.find(p => p.id === id) || null;
  },

  async createProduct(input: CreateProductInput): Promise<Product> {
    const newId = `prod-${Date.now()}`;
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const now = new Date().toISOString();

    const newProduct: Product = {
      id: newId,
      name: input.name,
      slug,
      sku: input.sku.toUpperCase(),
      category: input.category,
      status: input.status || 'Briefing',
      description: input.description || '',
      coverImageUrl: input.coverImageUrl || null,
      fabricType: input.fabricType || 'Algodão',
      printTechnique: input.printTechnique || 'Serigrafia',
      supplierName: input.supplierName || 'Fornecedor Local',
      supplierLeadTimeDays: input.supplierLeadTimeDays || 15,
      targetDeliveryDate: input.targetDeliveryDate || null,
      costPrice: input.costPrice || 0,
      memberPrice: input.memberPrice || 0,
      nonMemberPrice: input.nonMemberPrice || 0,
      createdAt: now,
      updatedAt: now,
      sizes: [
        { id: `sz-${Date.now()}-pp`, productId: newId, sizeName: 'PP', quantityPreOrder: 0, quantityStock: 0, createdAt: now, updatedAt: now },
        { id: `sz-${Date.now()}-p`, productId: newId, sizeName: 'P', quantityPreOrder: 0, quantityStock: 0, createdAt: now, updatedAt: now },
        { id: `sz-${Date.now()}-m`, productId: newId, sizeName: 'M', quantityPreOrder: 0, quantityStock: 0, createdAt: now, updatedAt: now },
        { id: `sz-${Date.now()}-g`, productId: newId, sizeName: 'G', quantityPreOrder: 0, quantityStock: 0, createdAt: now, updatedAt: now },
        { id: `sz-${Date.now()}-gg`, productId: newId, sizeName: 'GG', quantityPreOrder: 0, quantityStock: 0, createdAt: now, updatedAt: now },
        { id: `sz-${Date.now()}-xgg`, productId: newId, sizeName: 'XGG', quantityPreOrder: 0, quantityStock: 0, createdAt: now, updatedAt: now }
      ]
    };

    try {
      if (process.env.DATABASE_URL) {
        const dbProduct = await prisma.product.create({
          data: {
            id: newProduct.id,
            name: newProduct.name,
            slug: newProduct.slug,
            sku: newProduct.sku,
            category: newProduct.category,
            status: newProduct.status,
            description: newProduct.description,
            coverImageUrl: newProduct.coverImageUrl,
            fabricType: newProduct.fabricType,
            printTechnique: newProduct.printTechnique,
            supplierName: newProduct.supplierName,
            supplierLeadTimeDays: newProduct.supplierLeadTimeDays,
            targetDeliveryDate: newProduct.targetDeliveryDate ? new Date(newProduct.targetDeliveryDate) : null,
            costPrice: newProduct.costPrice,
            memberPrice: newProduct.memberPrice,
            nonMemberPrice: newProduct.nonMemberPrice,
            sizes: {
              create: (newProduct.sizes || []).map(s => ({
                sizeName: s.sizeName,
                quantityPreOrder: s.quantityPreOrder,
                quantityStock: s.quantityStock
              }))
            }
          },
          include: { sizes: true }
        });
        return dbProduct as unknown as Product;
      }
    } catch (err) {
      console.warn('Prisma createProduct fallback.');
    }

    memoryProductsStore.unshift(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product | null> {
    const now = new Date().toISOString();

    try {
      if (process.env.DATABASE_URL) {
        const dbProduct = await prisma.product.update({
          where: { id },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.sku && { sku: input.sku.toUpperCase() }),
            ...(input.category && { category: input.category }),
            ...(input.status && { status: input.status }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.coverImageUrl !== undefined && { coverImageUrl: input.coverImageUrl }),
            ...(input.fabricType !== undefined && { fabricType: input.fabricType }),
            ...(input.printTechnique !== undefined && { printTechnique: input.printTechnique }),
            ...(input.supplierName !== undefined && { supplierName: input.supplierName }),
            ...(input.supplierLeadTimeDays !== undefined && { supplierLeadTimeDays: input.supplierLeadTimeDays }),
            ...(input.targetDeliveryDate && { targetDeliveryDate: new Date(input.targetDeliveryDate) }),
            ...(input.costPrice !== undefined && { costPrice: input.costPrice }),
            ...(input.memberPrice !== undefined && { memberPrice: input.memberPrice }),
            ...(input.nonMemberPrice !== undefined && { nonMemberPrice: input.nonMemberPrice }),
          },
          include: { sizes: true }
        });
        return dbProduct as unknown as Product;
      }
    } catch (err) {
      console.warn('Prisma updateProduct fallback.');
    }

    const index = memoryProductsStore.findIndex(p => p.id === id);
    if (index === -1) return null;

    memoryProductsStore[index] = {
      ...memoryProductsStore[index],
      ...input,
      updatedAt: now
    };
    return memoryProductsStore[index];
  },

  async updateProductSizes(id: string, sizesData: { sizeName: string; quantityPreOrder: number; quantityStock: number }[]): Promise<Product | null> {
    try {
      if (process.env.DATABASE_URL) {
        // Deletamos tamanhos antigos e criamos novos, ou atualizamos um a um
        await prisma.productSize.deleteMany({ where: { productId: id } });
        const dbProduct = await prisma.product.update({
          where: { id },
          data: {
            sizes: {
              create: sizesData.map(s => ({
                sizeName: s.sizeName,
                quantityPreOrder: s.quantityPreOrder,
                quantityStock: s.quantityStock
              }))
            }
          },
          include: { sizes: true }
        });
        return dbProduct as unknown as Product;
      }
    } catch (err) {
      console.warn('Prisma updateProductSizes fallback.');
    }

    const index = memoryProductsStore.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedSizes = sizesData.map((s, idx) => ({
      id: `sz-${id}-${s.sizeName.toLowerCase()}-${idx}`,
      productId: id,
      sizeName: s.sizeName,
      quantityPreOrder: s.quantityPreOrder,
      quantityStock: s.quantityStock,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    memoryProductsStore[index].sizes = updatedSizes;
    memoryProductsStore[index].updatedAt = new Date().toISOString();
    return memoryProductsStore[index];
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      if (process.env.DATABASE_URL) {
        await prisma.product.delete({ where: { id } });
        return true;
      }
    } catch (err) {
      console.warn('Prisma deleteProduct fallback.');
    }

    const initialLength = memoryProductsStore.length;
    memoryProductsStore = memoryProductsStore.filter(p => p.id !== id);
    return memoryProductsStore.length < initialLength;
  }
};

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    try {
      if (process.env.DATABASE_URL) {
        return await prisma.category.findMany({ orderBy: { name: 'asc' } }) as unknown as Category[];
      }
    } catch (err) {
      console.warn('Prisma DB error in getAllCategories.');
    }
    return [...memoryCategoriesStore].sort((a, b) => a.name.localeCompare(b.name));
  },

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: input.name,
      description: input.description || null,
      createdAt: new Date().toISOString()
    };
    try {
      if (process.env.DATABASE_URL) {
        return await prisma.category.create({ 
          data: { name: input.name, description: input.description } 
        }) as unknown as Category;
      }
    } catch (err) {
      console.warn('Prisma DB error in createCategory.');
    }
    memoryCategoriesStore.push(newCat);
    return newCat;
  },

  async updateCategory(id: string, input: Partial<CreateCategoryInput>): Promise<Category | null> {
    try {
      if (process.env.DATABASE_URL) {
        return await prisma.category.update({
          where: { id },
          data: { 
            ...(input.name && { name: input.name }), 
            description: input.description 
          }
        }) as unknown as Category;
      }
    } catch (err) {
      console.warn('Prisma DB error in updateCategory.');
    }
    const idx = memoryCategoriesStore.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryCategoriesStore[idx] = {
        ...memoryCategoriesStore[idx],
        ...input
      };
      return memoryCategoriesStore[idx];
    }
    return null;
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      if (process.env.DATABASE_URL) {
        await prisma.category.delete({ where: { id } });
        return true;
      }
    } catch (err) {
      console.warn('Prisma DB error in deleteCategory.');
    }
    const len = memoryCategoriesStore.length;
    memoryCategoriesStore = memoryCategoriesStore.filter(c => c.id !== id);
    return memoryCategoriesStore.length < len;
  }
};

export const supplierService = {
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      if (process.env.DATABASE_URL) {
        return await prisma.supplier.findMany({ orderBy: { name: 'asc' } }) as unknown as Supplier[];
      }
    } catch (err) {
      console.warn('Prisma DB error in getAllSuppliers.');
    }
    return [...memorySuppliersStore].sort((a, b) => a.name.localeCompare(b.name));
  },

  async createSupplier(input: CreateSupplierInput): Promise<Supplier> {
    const now = new Date().toISOString();
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: input.name,
      contactName: input.contactName || null,
      phone: input.phone || null,
      email: input.email || null,
      cityState: input.cityState || null,
      pixKey: input.pixKey || null,
      paymentTerms: input.paymentTerms || null,
      rating: input.rating !== undefined ? input.rating : 5,
      notes: input.notes || null,
      createdAt: now,
      updatedAt: now
    };
    try {
      if (process.env.DATABASE_URL) {
        return await prisma.supplier.create({
          data: {
            name: input.name,
            contactName: input.contactName,
            phone: input.phone,
            email: input.email,
            cityState: input.cityState,
            pixKey: input.pixKey,
            paymentTerms: input.paymentTerms,
            rating: input.rating !== undefined ? input.rating : 5,
            notes: input.notes
          }
        }) as unknown as Supplier;
      }
    } catch (err) {
      console.warn('Prisma DB error in createSupplier.');
    }
    memorySuppliersStore.push(newSup);
    return newSup;
  },

  async updateSupplier(id: string, input: Partial<CreateSupplierInput>): Promise<Supplier | null> {
    const now = new Date().toISOString();
    try {
      if (process.env.DATABASE_URL) {
        return await prisma.supplier.update({
          where: { id },
          data: {
            ...(input.name && { name: input.name }),
            contactName: input.contactName,
            phone: input.phone,
            email: input.email,
            cityState: input.cityState,
            pixKey: input.pixKey,
            paymentTerms: input.paymentTerms,
            ...(input.rating !== undefined && { rating: input.rating }),
            notes: input.notes
          }
        }) as unknown as Supplier;
      }
    } catch (err) {
      console.warn('Prisma DB error in updateSupplier.');
    }
    const idx = memorySuppliersStore.findIndex(s => s.id === id);
    if (idx !== -1) {
      memorySuppliersStore[idx] = {
        ...memorySuppliersStore[idx],
        ...input,
        updatedAt: now
      };
      return memorySuppliersStore[idx];
    }
    return null;
  },

  async deleteSupplier(id: string): Promise<boolean> {
    try {
      if (process.env.DATABASE_URL) {
        await prisma.supplier.delete({ where: { id } });
        return true;
      }
    } catch (err) {
      console.warn('Prisma DB error in deleteSupplier.');
    }
    const len = memorySuppliersStore.length;
    memorySuppliersStore = memorySuppliersStore.filter(s => s.id !== id);
    return memorySuppliersStore.length < len;
  }
};

export const quoteService = {
  async getAllQuotes(): Promise<ProductQuote[]> {
    try {
      if (process.env.DATABASE_URL) {
        const quotes = await prisma.productQuote.findMany({
          include: { category: true, supplier: true },
          orderBy: { updatedAt: 'desc' }
        });
        return quotes as unknown as ProductQuote[];
      }
    } catch (err) {
      console.warn('Prisma DB error in getAllQuotes.');
    }
    return memoryQuotesStore.map(q => ({
      ...q,
      category: memoryCategoriesStore.find(c => c.id === q.categoryId),
      supplier: memorySuppliersStore.find(s => s.id === q.supplierId)
    })).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async createQuote(input: CreateQuoteInput): Promise<ProductQuote> {
    const now = new Date().toISOString();
    const newQuote: ProductQuote = {
      id: `quote-${Date.now()}`,
      productName: input.productName,
      categoryId: input.categoryId,
      supplierId: input.supplierId,
      unitCost: input.unitCost,
      minQuantity: input.minQuantity !== undefined ? input.minQuantity : 50,
      leadTimeDays: input.leadTimeDays,
      materialSpecs: input.materialSpecs || null,
      printTechnique: input.printTechnique || null,
      status: input.status || 'EM_ANALISE',
      notes: input.notes || null,
      createdAt: now,
      updatedAt: now
    };
    try {
      if (process.env.DATABASE_URL) {
        const created = await prisma.productQuote.create({
          data: {
            productName: input.productName,
            categoryId: input.categoryId,
            supplierId: input.supplierId,
            unitCost: input.unitCost,
            minQuantity: input.minQuantity !== undefined ? input.minQuantity : 50,
            leadTimeDays: input.leadTimeDays,
            materialSpecs: input.materialSpecs,
            printTechnique: input.printTechnique,
            status: input.status || 'EM_ANALISE',
            notes: input.notes
          },
          include: { category: true, supplier: true }
        });
        return created as unknown as ProductQuote;
      }
    } catch (err) {
      console.warn('Prisma DB error in createQuote.');
    }
    memoryQuotesStore.push(newQuote);
    return {
      ...newQuote,
      category: memoryCategoriesStore.find(c => c.id === newQuote.categoryId),
      supplier: memorySuppliersStore.find(s => s.id === newQuote.supplierId)
    };
  },

  async updateQuote(id: string, input: Partial<CreateQuoteInput>): Promise<ProductQuote | null> {
    const now = new Date().toISOString();
    try {
      if (process.env.DATABASE_URL) {
        const updated = await prisma.productQuote.update({
          where: { id },
          data: {
            ...(input.productName && { productName: input.productName }),
            ...(input.categoryId && { categoryId: input.categoryId }),
            ...(input.supplierId && { supplierId: input.supplierId }),
            ...(input.unitCost !== undefined && { unitCost: input.unitCost }),
            ...(input.minQuantity !== undefined && { minQuantity: input.minQuantity }),
            ...(input.leadTimeDays !== undefined && { leadTimeDays: input.leadTimeDays }),
            materialSpecs: input.materialSpecs,
            printTechnique: input.printTechnique,
            ...(input.status && { status: input.status }),
            notes: input.notes
          },
          include: { category: true, supplier: true }
        });
        return updated as unknown as ProductQuote;
      }
    } catch (err) {
      console.warn('Prisma DB error in updateQuote.');
    }
    const idx = memoryQuotesStore.findIndex(q => q.id === id);
    if (idx !== -1) {
      memoryQuotesStore[idx] = {
        ...memoryQuotesStore[idx],
        ...input,
        updatedAt: now
      } as any;
      return {
        ...memoryQuotesStore[idx],
        category: memoryCategoriesStore.find(c => c.id === memoryQuotesStore[idx].categoryId),
        supplier: memorySuppliersStore.find(s => s.id === memoryQuotesStore[idx].supplierId)
      };
    }
    return null;
  },

  async deleteQuote(id: string): Promise<boolean> {
    try {
      if (process.env.DATABASE_URL) {
        await prisma.productQuote.delete({ where: { id } });
        return true;
      }
    } catch (err) {
      console.warn('Prisma DB error in deleteQuote.');
    }
    const len = memoryQuotesStore.length;
    memoryQuotesStore = memoryQuotesStore.filter(q => q.id !== id);
    return memoryQuotesStore.length < len;
  }
};

export const kitService = {
  async getAllKits(): Promise<Kit[]> {
    try {
      if (process.env.DATABASE_URL) {
        const dbKits = await prisma.kit.findMany({
          include: {
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        return dbKits as unknown as Kit[];
      }
    } catch (err) {
      console.warn('Prisma DB error in getAllKits, falling back to memory.');
    }
    return memoryKitsStore.map(k => ({
      ...k,
      items: (k.items || []).map(ki => ({
        ...ki,
        product: memoryProductsStore.find(p => p.id === ki.productId)
      }))
    })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createKit(input: CreateKitInput): Promise<Kit> {
    const now = new Date().toISOString();
    const id = `kit-${Date.now()}`;
    const newKit: Kit = {
      id,
      name: input.name,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      memberPrice: input.memberPrice,
      nonMemberPrice: input.nonMemberPrice,
      items: input.items.map((item, idx) => ({
        id: `ki-${id}-${idx}`,
        kitId: id,
        productId: item.productId,
        quantity: item.quantity
      })),
      createdAt: now
    };

    try {
      if (process.env.DATABASE_URL) {
        const dbKit = await prisma.kit.create({
          data: {
            name: input.name,
            description: input.description,
            imageUrl: input.imageUrl,
            memberPrice: input.memberPrice,
            nonMemberPrice: input.nonMemberPrice,
            items: {
              create: input.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
              }))
            }
          },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        });
        return dbKit as unknown as Kit;
      }
    } catch (err) {
      console.warn('Prisma DB error in createKit, falling back to memory.');
    }

    memoryKitsStore.push(newKit);
    return {
      ...newKit,
      items: (newKit.items || []).map(ki => ({
        ...ki,
        product: memoryProductsStore.find(p => p.id === ki.productId)
      }))
    };
  },

  async deleteKit(id: string): Promise<boolean> {
    try {
      if (process.env.DATABASE_URL) {
        await prisma.kit.delete({ where: { id } });
        return true;
      }
    } catch (err) {
      console.warn('Prisma DB error in deleteKit, falling back to memory.');
    }
    const len = memoryKitsStore.length;
    memoryKitsStore = memoryKitsStore.filter(k => k.id !== id);
    return memoryKitsStore.length < len;
  }
};

export const orderService = {
  async getAllOrders(): Promise<Order[]> {
    if (process.env.DATABASE_URL) {
      const dbOrders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true,
              kit: {
                include: {
                  items: {
                    include: {
                      product: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return dbOrders as unknown as Order[];
    }
    return memoryOrdersStore.map(o => ({
      ...o,
      items: (o.items || []).map(oi => ({
        ...oi,
        product: oi.productId ? memoryProductsStore.find(p => p.id === oi.productId) : null,
        kit: oi.kitId ? memoryKitsStore.find(k => k.id === oi.kitId) : null
      }))
    })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const now = new Date().toISOString();
    const orderId = `ord-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || null,
      totalAmount: input.totalAmount,
      paymentStatus: input.paymentStatus || 'PENDENTE',
      receiptUrl: input.receiptUrl || null,
      notes: input.notes || null,
      items: input.items.map((item, idx) => ({
        id: `oi-${orderId}-${idx}`,
        orderId,
        productId: item.productId || null,
        kitId: item.kitId || null,
        size: item.size || null,
        unitPrice: item.unitPrice,
        quantity: item.quantity
      })),
      createdAt: now,
      updatedAt: now
    };

    if (process.env.DATABASE_URL) {
      const dbOrder = await prisma.order.create({
        data: {
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          totalAmount: input.totalAmount,
          paymentStatus: input.paymentStatus || 'PENDENTE',
          receiptUrl: input.receiptUrl,
          notes: input.notes,
          items: {
            create: input.items.map(item => ({
              productId: item.productId || undefined,
              kitId: item.kitId || undefined,
              size: item.size || undefined,
              unitPrice: item.unitPrice,
              quantity: item.quantity
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true,
              kit: true
            }
          }
        }
      });
      return dbOrder as unknown as Order;
    }

    memoryOrdersStore.push(newOrder);
    return {
      ...newOrder,
      items: (newOrder.items || []).map(oi => ({
        ...oi,
        product: oi.productId ? memoryProductsStore.find(p => p.id === oi.productId) : null,
        kit: oi.kitId ? memoryKitsStore.find(k => k.id === oi.kitId) : null
      }))
    };
  },

  async updateOrderStatus(id: string, paymentStatus: string): Promise<Order | null> {
    const now = new Date().toISOString();
    if (process.env.DATABASE_URL) {
      const dbOrder = await prisma.order.update({
        where: { id },
        data: { paymentStatus },
        include: {
          items: {
            include: {
              product: true,
              kit: true
            }
          }
        }
      });
      return dbOrder as unknown as Order;
    }

    const idx = memoryOrdersStore.findIndex(o => o.id === id);
    if (idx !== -1) {
      memoryOrdersStore[idx] = {
        ...memoryOrdersStore[idx],
        paymentStatus,
        updatedAt: now
      };
      return {
        ...memoryOrdersStore[idx],
        items: (memoryOrdersStore[idx].items || []).map(oi => ({
          ...oi,
          product: oi.productId ? memoryProductsStore.find(p => p.id === oi.productId) : null,
          kit: oi.kitId ? memoryKitsStore.find(k => k.id === oi.kitId) : null
        }))
      };
    }
    return null;
  },

  async updateOrderReceipt(id: string, receiptUrl: string): Promise<Order | null> {
    const now = new Date().toISOString();
    if (process.env.DATABASE_URL) {
      const dbOrder = await prisma.order.update({
        where: { id },
        data: { receiptUrl, paymentStatus: 'AGUARDANDO_VALIDACAO' },
        include: {
          items: {
            include: {
              product: true,
              kit: true
            }
          }
        }
      });
      return dbOrder as unknown as Order;
    }

    const idx = memoryOrdersStore.findIndex(o => o.id === id);
    if (idx !== -1) {
      memoryOrdersStore[idx] = {
        ...memoryOrdersStore[idx],
        receiptUrl,
        paymentStatus: 'AGUARDANDO_VALIDACAO',
        updatedAt: now
      };
      return {
        ...memoryOrdersStore[idx],
        items: (memoryOrdersStore[idx].items || []).map(oi => ({
          ...oi,
          product: oi.productId ? memoryProductsStore.find(p => p.id === oi.productId) : null,
          kit: oi.kitId ? memoryKitsStore.find(k => k.id === oi.kitId) : null
        }))
      };
    }
    return null;
  },

  async updateOrderDelivery(id: string, deliveryStatus: string, deliveredById?: string, pickedUpBy?: string): Promise<Order | null> {
    if (process.env.DATABASE_URL) {
      const data: any = { deliveryStatus };
      if (deliveryStatus === 'DELIVERED') {
        data.deliveredAt = new Date();
        data.deliveredById = deliveredById;
        data.pickedUpBy = pickedUpBy;
      }
      const dbOrder = await prisma.order.update({
        where: { id },
        data,
        include: {
          items: {
            include: {
              product: true,
              kit: true
            }
          }
        }
      });
      return dbOrder as unknown as Order;
    }
    return null;
  },

  async deleteOrder(id: string): Promise<boolean> {
    if (process.env.DATABASE_URL) {
      await prisma.order.delete({ where: { id } });
      return true;
    }
    const len = memoryOrdersStore.length;
    memoryOrdersStore = memoryOrdersStore.filter(o => o.id !== id);
    return memoryOrdersStore.length < len;
  }
};

export const ideaVoteService = {
  async getVotesByIdea(ideaId: string): Promise<IdeaVote[]> {
    try {
      if (process.env.DATABASE_URL) {
        return await prisma.ideaVote.findMany({
          where: { ideaId },
          orderBy: { createdAt: 'desc' }
        }) as unknown as IdeaVote[];
      }
    } catch (err) {
      console.warn('Prisma DB error in getVotesByIdea, falling back to memory.');
    }
    return memoryVotesStore
      .filter(v => v.ideaId === ideaId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createVote(ideaId: string, input: CreateVoteInput): Promise<IdeaVote> {
    const now = new Date().toISOString();
    const newVote: IdeaVote = {
      id: `vote-${Date.now()}`,
      ideaId,
      voterName: input.voterName,
      voterPhone: input.voterPhone || null,
      voterCourse: input.voterCourse || null,
      intendsToBuy: input.intendsToBuy || false,
      preferredSize: input.preferredSize || null,
      createdAt: now
    };

    try {
      if (process.env.DATABASE_URL) {
        const [dbVote] = await prisma.$transaction([
          prisma.ideaVote.create({
            data: {
              ideaId,
              voterName: input.voterName,
              voterPhone: input.voterPhone,
              voterCourse: input.voterCourse,
              intendsToBuy: input.intendsToBuy || false,
              preferredSize: input.preferredSize
            }
          }),
          prisma.idea.update({
            where: { id: ideaId },
            data: { votesCount: { increment: 1 } }
          })
        ]);
        return dbVote as unknown as IdeaVote;
      }
    } catch (err) {
      console.warn('Prisma DB error in createVote, falling back to memory.');
    }

    memoryVotesStore.push(newVote);
    const ideaIdx = memoryIdeasStore.findIndex(i => i.id === ideaId);
    if (ideaIdx !== -1) {
      memoryIdeasStore[ideaIdx].votesCount += 1;
    }
    return newVote;
  }
};
