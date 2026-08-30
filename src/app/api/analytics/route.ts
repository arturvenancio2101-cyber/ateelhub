import { NextResponse } from 'next/server';
import { productService, ideaService } from '@/lib/prisma';
import { getExecutiveMetrics } from '@/lib/mock-data';

export async function GET() {
  try {
    const products = await productService.getAllProducts();
    const ideas = await ideaService.getAllIdeas();
    const metrics = getExecutiveMetrics(products, ideas);
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar analíticos da ATEEL', details: error.message },
      { status: 500 }
    );
  }
}
