import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ 
        code: "AUTH_TOKEN_MISSING_OR_INVALID", 
        message: "No autorizado." 
      }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        code: "VALIDATION_FAILED",
        message: "El carrito no puede estar vacío.",
        details: [{ field: "items", rule: "minimum_length_1" }]
      }, { status: 422 });
    }

    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json({ message: "Algunos productos no existen o ya no están disponibles." }, { status: 400 });
    }

    let calculatedTotal = 0;
    const orderItemsData = items.map((item: any) => {
      const product = dbProducts.find(p => p.id === item.productId);
      const unitPrice = product!.price;
      calculatedTotal += unitPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice
      };
    });

    const crypto = require('crypto');
    const folio = crypto.randomBytes(4).toString('hex').toUpperCase();

    const newOrder = await prisma.order.create({
      data: {
        customerId: user.id, 
        folio,
        total: calculatedTotal,
        status: 'PENDIENTE',
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error("Error al crear orden:", error);
    return NextResponse.json({ 
      code: "INTERNAL_SERVER_ERROR", 
      message: "Error interno del servidor." 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ 
        code: "AUTH_TOKEN_MISSING_OR_INVALID", 
        message: "No autorizado." 
      }, { status: 401 });
    }

    let orders;
    if (user.role === 'ADMIN') {
      orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } }, items: { include: { product: true } } }
      });
    } else {
      orders = await prisma.order.findMany({
        where: { customerId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      });
    }

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json({ 
      code: "INTERNAL_SERVER_ERROR", 
      message: "Error interno del servidor." 
    }, { status: 500 });
  }
}