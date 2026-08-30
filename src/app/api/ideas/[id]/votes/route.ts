import { NextResponse } from 'next/server';
import { ideaVoteService } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await ideaVoteService.getVotesByIdea(id);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    if (!body.voterName) {
      return NextResponse.json({ success: false, error: 'O nome do votante é obrigatório.' }, { status: 400 });
    }
    const data = await ideaVoteService.createVote(id, body);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
