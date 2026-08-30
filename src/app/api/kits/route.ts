import { NextResponse } from 'next/server';
import { kitService } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await kitService.getAllKits();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.memberPrice || !body.nonMemberPrice || !body.items || !body.items.length) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }
    const data = await kitService.createKit(body);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
