import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.includes('admin-token')) {
    return NextResponse.json({ 
      code: "INSUFFICIENT_PERMISSIONS", 
      message: "Solo el administrador puede mutar estados.",
      details: []
    }, { status: 403 });
  }

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ code: "RESOURCE_NOT_FOUND", message: "Orden no encontrada." }, { status: 404 });
    }

    const body = await request.json();

    if (order.status === 'PENDING' && body.status === 'SHIPPED') {
      return NextResponse.json({
        code: "INVALID_STATE_TRANSITION",
        message: "La petición rompe el ciclo de vida o los pasos lógicos del negocio.",
        details: [{ field: "status", rule: "cannot_skip_paid_state" }]
      }, { status: 409 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: body.status }
    });

    return NextResponse.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      message: "Estado modificado con éxito."
    }, { status: 200 });

  } catch {
    return NextResponse.json({ code: "VALIDATION_FAILED", message: "JSON inválido o error al actualizar.", details: [] }, { status: 422 });
  }
}
