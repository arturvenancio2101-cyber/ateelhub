import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/lib/prisma';
import { CreateQuoteInput } from '@/types/plm';

export async function GET() {
  try {
    const quotes = await quoteService.getAllQuotes();
    return NextResponse.json({ success: true, count: quotes.length, data: quotes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar cotações', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateQuoteInput = await request.json();
    
    // Validar campos obrigatórios
    if (!body.productName || !body.categoryId || !body.supplierId || body.unitCost === undefined || body.leadTimeDays === undefined) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios ausentes: productName, categoryId, supplierId, unitCost e leadTimeDays são requeridos.' },
        { status: 400 }
      );
    }

    const newQuote = await quoteService.createQuote(body);
    return NextResponse.json({ success: true, message: 'Cotação cadastrada com sucesso', data: newQuote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar cotação', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode'); // 'all' or 'orphan'

    if (mode === 'orphan') {
      const count = await quoteService.deleteOrphanQuotes();
      return NextResponse.json({ success: true, message: `${count} cotações órfãs foram removidas com sucesso!`, count });
    }

    await quoteService.deleteAllQuotes();
    return NextResponse.json({ success: true, message: 'Todas as cotações foram zeradas com sucesso!' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao limpar cotações', details: error.message },
      { status: 500 }
    );
  }
}
