import { NextRequest, NextResponse } from 'next/server';
import { folderService } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const body = await request.json();
    const updatedItem = await folderService.updateFolderItem(params.itemId, body);

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: 'Item de exemplo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Exemplo de produto atualizado!', data: updatedItem });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar item de exemplo', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const success = await folderService.deleteFolderItem(params.itemId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Item não encontrado ou erro ao deletar' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Item removido da pasta com sucesso!' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao remover item da pasta', details: error.message },
      { status: 500 }
    );
  }
}
