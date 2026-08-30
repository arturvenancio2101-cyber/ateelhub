import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/prisma';

// GET /api/products/[id] -> Detalhes do produto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await productService.getProductById(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Produto não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar detalhes do produto', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] -> Atualiza produto ou grade de tamanhos
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Se a requisição contiver 'sizes', atualiza a grade de tamanhos separadamente
    if (body.sizes && Array.isArray(body.sizes)) {
      const updatedWithSizes = await productService.updateProductSizes(params.id, body.sizes);
      if (!updatedWithSizes) {
        return NextResponse.json({ success: false, error: 'Erro ao atualizar grade de tamanhos' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Grade de tamanhos atualizada!', data: updatedWithSizes });
    }

    const updated = await productService.updateProduct(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Produto não encontrado para atualização' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Produto atualizado com sucesso', data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar produto', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] -> Remove do catálogo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await productService.deleteProduct(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Produto não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Produto removido com sucesso' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao remover produto', details: error.message },
      { status: 500 }
    );
  }
}
