import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await quoteService.updateQuote(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Cotação não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Cotação atualizada com sucesso', data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar cotação', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await quoteService.deleteQuote(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Cotação não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Cotação removida com sucesso' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao remover cotação', details: error.message },
      { status: 500 }
    );
  }
}
