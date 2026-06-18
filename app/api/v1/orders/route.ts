import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth'; // Importamos el helper

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
    const { items, total } = body;
    const newOrder = await prisma.order.create({
      data: {
        customerId: user.id, 
        total: parseFloat(total),
        status: 'PENDING',
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