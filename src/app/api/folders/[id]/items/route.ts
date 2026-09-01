import { NextRequest, NextResponse } from 'next/server';
import { folderService } from '@/lib/prisma';
import { CreateFolderItemInput } from '@/types/plm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Omit<CreateFolderItemInput, 'folderId'> = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'O título do exemplo de produto/ideia é obrigatório.' },
        { status: 400 }
      );
    }

    const newItem = await folderService.createFolderItem({
      ...body,
      folderId: params.id
    });

    return NextResponse.json({ success: true, message: 'Item adicionado à pasta!', data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao adicionar item na pasta', details: error.message },
      { status: 500 }
    );
  }
}
