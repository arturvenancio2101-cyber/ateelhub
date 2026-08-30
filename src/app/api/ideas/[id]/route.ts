import { NextRequest, NextResponse } from 'next/server';
import { ideaService } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, status, productId } = await request.json();

    if (action === 'vote') {
      const updatedIdea = await ideaService.voteIdea(params.id);
      if (!updatedIdea) {
        return NextResponse.json({ success: false, error: 'Ideia não encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Voto computado com sucesso!', data: updatedIdea });
    }

    if (action === 'status') {
      const updatedIdea = await ideaService.updateIdeaStatus(params.id, status, productId);
      if (!updatedIdea) {
        return NextResponse.json({ success: false, error: 'Ideia não encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Status da ideia atualizado!', data: updatedIdea });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida ou não suportada' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao gerenciar ideia', details: error.message },
      { status: 500 }
    );
  }
}
