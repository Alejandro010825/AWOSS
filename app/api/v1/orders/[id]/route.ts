import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ 
        code: "AUTH_TOKEN_MISSING_OR_INVALID", 
        message: "No autorizado." 
      }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!order) {
      return NextResponse.json({ 
        code: "NOT_FOUND", 
        message: "La orden no existe." 
      }, { status: 404 });
    }

    if (user.id !== order.customerId && user.role !== 'ADMIN') {
      return NextResponse.json({ 
        code: "INSUFFICIENT_PERMISSIONS", 
        message: "No posees permisos para ver esta orden." 
      }, { status: 403 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error("Error al consultar la orden:", error);
    return NextResponse.json({ 
      code: "INTERNAL_SERVER_ERROR", 
      message: "Error interno del servidor." 
    }, { status: 500 });
  }
}