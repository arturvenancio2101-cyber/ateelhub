import { NextResponse } from 'next/server';
import { orderService } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    
    let updated;
    if ('paymentStatus' in body) {
      updated = await orderService.updateOrderStatus(id, body.paymentStatus);
    } else if ('receiptUrl' in body) {
      updated = await orderService.updateOrderReceipt(id, body.receiptUrl);
    } else if ('deliveryStatus' in body) {
      updated = await orderService.updateOrderDelivery(id, body.deliveryStatus, body.deliveredById, body.pickedUpBy);
    } else {
      return NextResponse.json({ success: false, error: 'Ação não suportada.' }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const success = await orderService.deleteOrder(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
