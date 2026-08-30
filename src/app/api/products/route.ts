import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/prisma';
import { CreateProductInput } from '@/types/plm';

// GET /api/products -> Lista todos os produtos com suporte a query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const products = await productService.getAllProducts({ category, status, search });
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar lista de produtos', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products -> Cria um novo produto no ciclo de vida
export async function POST(request: NextRequest) {
  try {
    const body: CreateProductInput = await request.json();

    if (!body.name || !body.sku || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios ausentes: name, sku e category são requeridos.' },
        { status: 400 }
      );
    }

    const createdProduct = await productService.createProduct(body);
    return NextResponse.json({ success: true, message: 'Produto criado com sucesso', data: createdProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar produto', details: error.message },
      { status: 500 }
    );
  }
}
