import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateSupplierQuoteInput } from '@/types/plm';

// POST /api/products/[id]/quotes
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: CreateSupplierQuoteInput = await request.json();
    
    // Authorization check could be added here
    
    if (!body.supplierName || !body.unitPrice) {
      return NextResponse.json(
        { success: false, error: 'Fornecedor e preço unitário são obrigatórios.' },
        { status: 400 }
      );
    }

    const quote = await prisma.supplierQuote.create({
      data: {
        productId: params.id,
        supplierName: body.supplierName,
        contact: body.contact,
        unitPrice: body.unitPrice,
        moq: body.moq ?? 50,
        sampleCost: body.sampleCost ?? 0,
        shippingCost: body.shippingCost ?? 0,
        leadTimeDays: body.leadTimeDays ?? 15,
        qualityRating: body.qualityRating ?? 5,
        notes: body.notes
      }
    });

    return NextResponse.json({ success: true, data: quote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar cotação', details: error.message },
      { status: 500 }
    );
  }
}
