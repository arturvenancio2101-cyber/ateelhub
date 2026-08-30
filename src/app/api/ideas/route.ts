import { NextRequest, NextResponse } from 'next/server';
import { ideaService } from '@/lib/prisma';
import { CreateIdeaInput } from '@/types/plm';

// GET /api/ideas -> Retorna todas as ideias ordenadas por votos
export async function GET() {
  try {
    const ideas = await ideaService.getAllIdeas();
    return NextResponse.json({ success: true, count: ideas.length, data: ideas });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar mural de ideias', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/ideas -> Cria uma nova sugestão/ideia no brainstorm
export async function POST(request: NextRequest) {
  try {
    const body: CreateIdeaInput = await request.json();

    if (!body.title || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios ausentes: título e categoria são requeridos.' },
        { status: 400 }
      );
    }

    const createdIdea = await ideaService.createIdea(body);
    return NextResponse.json({ success: true, message: 'Ideia sugerida com sucesso!', data: createdIdea }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar ideia', details: error.message },
      { status: 500 }
    );
  }
}
