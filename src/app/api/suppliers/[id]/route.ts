import { NextRequest, NextResponse } from 'next/server';
import { supplierService } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await supplierService.updateSupplier(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Fornecedor não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Fornecedor atualizado com sucesso', data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar fornecedor', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await supplierService.deleteSupplier(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Fornecedor não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Fornecedor removido com sucesso' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao remover fornecedor', details: error.message },
      { status: 500 }
    );
  }
}
