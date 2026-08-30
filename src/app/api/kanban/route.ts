import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateKanbanItemInput } from '@/types/plm';

export async function GET(request: NextRequest) {
  try {
    const items = await prisma.kanbanItem.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateKanbanItemInput = await request.json();
    
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Título é obrigatório' }, { status: 400 });
    }

    const item = await prisma.kanbanItem.create({
      data: {
        title: body.title,
        description: body.description,
        stage: body.stage || 'IDEA',
        priority: body.priority || 'MEDIUM',
        isWeeklyFocus: body.isWeeklyFocus || false,
        assignedTo: body.assignedTo,
        dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
        checklist: body.checklist ? (body.checklist as any) : null,
        productId: body.productId
      }
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
