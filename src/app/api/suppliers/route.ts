import { NextRequest, NextResponse } from 'next/server';
import { supplierService } from '@/lib/prisma';
import { CreateSupplierInput } from '@/types/plm';

export async function GET() {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    return NextResponse.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar fornecedores', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSupplierInput = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'O nome do fornecedor é obrigatório.' },
        { status: 400 }
      );
    }

    const newSupplier = await supplierService.createSupplier(body);
    return NextResponse.json({ success: true, message: 'Fornecedor criado com sucesso', data: newSupplier }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar fornecedor', details: error.message },
      { status: 500 }
    );
  }
}
