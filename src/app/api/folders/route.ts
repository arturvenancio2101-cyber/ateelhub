import { NextRequest, NextResponse } from 'next/server';
import { folderService } from '@/lib/prisma';
import { CreateFolderInput } from '@/types/plm';

export async function GET() {
  try {
    const folders = await folderService.getAllFolders();
    return NextResponse.json({ success: true, count: folders.length, data: folders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar pastas de exemplos', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateFolderInput = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'O nome da pasta é obrigatório.' },
        { status: 400 }
      );
    }

    const createdFolder = await folderService.createFolder(body);
    return NextResponse.json({ success: true, message: 'Pasta criada com sucesso!', data: createdFolder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar pasta', details: error.message },
      { status: 500 }
    );
  }
}
