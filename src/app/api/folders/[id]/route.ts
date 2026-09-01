import { NextRequest, NextResponse } from 'next/server';
import { folderService } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedFolder = await folderService.updateFolder(params.id, body);

    if (!updatedFolder) {
      return NextResponse.json(
        { success: false, error: 'Pasta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Pasta atualizada!', data: updatedFolder });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar pasta', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await folderService.deleteFolder(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Pasta não encontrada ou falha ao remover' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Pasta removida com sucesso!' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao remover pasta', details: error.message },
      { status: 500 }
    );
  }
}
