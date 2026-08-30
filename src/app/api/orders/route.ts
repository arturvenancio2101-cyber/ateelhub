import { NextResponse } from 'next/server';
import { orderService } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await orderService.getAllOrders();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.customerPhone || !body.totalAmount || !body.items || !body.items.length) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }
    const data = await orderService.createOrder(body);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
