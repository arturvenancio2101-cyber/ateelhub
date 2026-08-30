import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/products/[id]/quotes/[quoteId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string, quoteId: string } }
) {
  try {
    const body = await request.json();

    if (body.action === 'select_winner') {
      // Begin Transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Reset all quotes for this product to not selected
        await tx.supplierQuote.updateMany({
          where: { productId: params.id },
          data: { isSelected: false }
        });

        // 2. Set the winner
        const winner = await tx.supplierQuote.update({
          where: { id: params.quoteId },
          data: { isSelected: true }
        });

        // 3. Update the Product cost base and supplier name
        const totalCost = winner.unitPrice + (winner.shippingCost / winner.moq);
        
        await tx.product.update({
          where: { id: params.id },
          data: {
            costPrice: totalCost,
            supplierName: winner.supplierName,
            supplierLeadTimeDays: winner.leadTimeDays,
            status: 'Cotação' // Or advance to next stage
          }
        });

        return winner;
      });

      return NextResponse.json({ success: true, message: 'Fornecedor selecionado com sucesso e custos base atualizados.', data: result });
    }

    return NextResponse.json({ success: false, error: 'Ação não suportada.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao processar cotação', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]/quotes/[quoteId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, quoteId: string } }
) {
  try {
    await prisma.supplierQuote.delete({
      where: { id: params.quoteId }
    });
    return NextResponse.json({ success: true, message: 'Cotação removida.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao remover cotação', details: error.message },
      { status: 500 }
    );
  }
}
