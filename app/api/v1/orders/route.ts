import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({
      code: "AUTH_TOKEN_MISSING_OR_INVALID",
      message: "Credenciales ausentes o firma de token expirada.",
      details: [{ field: "Authorization", rule: "required_bearer_token" }]
    }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({
        code: "VALIDATION_FAILED",
        message: "Los parámetros del payload no cumplen con las reglas de negocio.",
        details: [{ field: "items", rule: "minimum_items_1" }]
      }, { status: 422 });
    }

    const total = body.items.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0);

    const newOrder = await prisma.order.create({
      data: {
        customerId: body.customerId, 
        total: total,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      code: "VALIDATION_FAILED", 
      message: "Revisa que los IDs de cliente y productos existan en la base de datos.",
      details: []
    }, { status: 422 });
  }
}
