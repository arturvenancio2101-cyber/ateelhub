import { NextResponse } from 'next/server';
import { orderService, productService, kitService } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Validação de Segurança (Header x-webhook-secret)
    const secret = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.WEBHOOK_SECRET || 'ateel-secret-key-2026';
    
    if (secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Não autorizado. Chave secreta inválida.' }, { status: 401 });
    }

    // 2. Leitura do Payload
    const body = await req.json();
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      itemType, 
      itemName, 
      size, 
      quantity, 
      totalAmount, 
      receiptUrl, 
      notes 
    } = body;

    // Validações básicas obrigatórias
    if (!customerName || !customerPhone || !itemName || !quantity) {
      return NextResponse.json({ 
        success: false, 
        error: 'Campos obrigatórios ausentes: customerName, customerPhone, itemName e quantity são necessários.' 
      }, { status: 400 });
    }

    // 3. Resolução do Produto ou Kit correspondente pelo nome (case-insensitive)
    let productId: string | null = null;
    let kitId: string | null = null;

    if (itemType === 'KIT') {
      const allKits = await kitService.getAllKits();
      const matchedKit = allKits.find(k => k.name.toLowerCase() === itemName.toLowerCase());
      if (matchedKit) {
        kitId = matchedKit.id;
      }
    } else {
      // Default to PRODUCT
      const allProducts = await productService.getAllProducts();
      const matchedProd = allProducts.find(p => p.name.toLowerCase() === itemName.toLowerCase());
      if (matchedProd) {
        productId = matchedProd.id;
      }
    }

    // Ajuste de anotações caso o produto/kit não tenha sido encontrado no banco
    let finalNotes = notes || '';
    if (!productId && !kitId) {
      finalNotes = `${finalNotes} [Item solicitado via Form: ${itemName} (${itemType || 'PRODUCT'})]`.trim();
    }

    // 4. Cálculo de Valores e Preço Unitário
    let finalTotalAmount = parseFloat(totalAmount);
    let unitPrice = 0;

    if (isNaN(finalTotalAmount) || finalTotalAmount <= 0) {
      // Busca preço padrão no catálogo
      let catalogPrice = 30.00; // Valor padrão de fallback
      if (productId) {
        const allProducts = await productService.getAllProducts();
        const p = allProducts.find(prod => prod.id === productId);
        catalogPrice = p?.memberPrice || 30.00;
      } else if (kitId) {
        const allKits = await kitService.getAllKits();
        const k = allKits.find(kt => kt.id === kitId);
        catalogPrice = k?.memberPrice || 80.00;
      }
      unitPrice = catalogPrice;
      finalTotalAmount = catalogPrice * quantity;
    } else {
      unitPrice = finalTotalAmount / quantity;
    }

    // Status de pagamento inicial
    // Se enviou o link do comprovante no form, entra como aguardando validação
    const paymentStatus = receiptUrl ? 'AGUARDANDO_VALIDACAO' : 'PENDENTE';

    // 5. Criação do Pedido através do serviço
    const newOrder = await orderService.createOrder({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      totalAmount: finalTotalAmount,
      paymentStatus,
      receiptUrl: receiptUrl || undefined,
      notes: finalNotes || undefined,
      items: [
        {
          productId,
          kitId,
          size: size || 'M',
          unitPrice,
          quantity
        }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Pedido integrado com sucesso via webhook do Google Forms.',
      data: newOrder
    });

  } catch (err: any) {
    console.error('Erro no webhook de integração do Google Forms:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
