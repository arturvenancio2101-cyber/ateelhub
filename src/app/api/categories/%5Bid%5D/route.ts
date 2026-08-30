import { NextRequest, NextResponse } from 'next/server';
import { categoryService } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await categoryService.updateCategory(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Categoria não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Categoria atualizada com sucesso', data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar categoria', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await categoryService.deleteCategory(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Categoria não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Categoria removida com sucesso' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao remover categoria', details: error.message },
      { status: 500 }
    );
  }
}
