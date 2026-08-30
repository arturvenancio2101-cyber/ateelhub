import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/lib/prisma';
import { CreateCategoryInput } from '@/types/plm';

export async function GET() {
  try {
    const categories = await categoryService.getAllCategories();
    return NextResponse.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar categorias', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryInput = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'O nome da categoria é obrigatório.' },
        { status: 400 }
      );
    }

    const newCategory = await categoryService.createCategory(body);
    return NextResponse.json({ success: true, message: 'Categoria criada com sucesso', data: newCategory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar categoria', details: error.message },
      { status: 500 }
    );
  }
}
