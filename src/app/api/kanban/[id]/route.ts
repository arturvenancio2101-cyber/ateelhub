import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    // Check if moving to product creation
    if (body.action === 'create_product') {
      const item = await prisma.kanbanItem.findUnique({ where: { id: params.id } });
      if (!item) throw new Error('Item não encontrado');

      // Begin transaction to create product and update item
      const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: item.title,
            slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now(),
            sku: `ATL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            category: 'Outro',
            status: item.stage === 'QUOTATION' ? 'Cotação' : 'Design',
            description: item.description
          }
        });

        const updatedItem = await tx.kanbanItem.update({
          where: { id: params.id },
          data: { productId: product.id }
        });

        return { product, item: updatedItem };
      });
      return NextResponse.json({ success: true, data: result.item, product: result.product });
    }

    const item = await prisma.kanbanItem.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        stage: body.stage,
        priority: body.priority,
        isWeeklyFocus: body.isWeeklyFocus,
        assignedTo: body.assignedTo,
        dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
        checklist: body.checklist ? (body.checklist as any) : null,
        productId: body.productId
      }
    });
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.kanbanItem.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
