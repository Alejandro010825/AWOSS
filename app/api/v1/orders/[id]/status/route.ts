import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ 
        code: "AUTH_TOKEN_MISSING_OR_INVALID", 
        message: "No autorizado." 
      }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ 
        code: "INSUFFICIENT_PERMISSIONS", 
        message: "Solo administradores pueden cambiar el estado de una orden." 
      }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body; 

    const currentOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!currentOrder) {
      return NextResponse.json({ message: "Orden no encontrada." }, { status: 404 });
    }

    const validTransitions: Record<string, string[]> = {
      'PENDIENTE': ['PROCESANDO'],
      'PROCESANDO': ['ENVIADO'],
      'ENVIADO': ['ENTREGADO'],
      'ENTREGADO': []
    };

    const currentStatus = currentOrder.status;
    
    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json({ 
        code: "INVALID_STATUS_TRANSITION",
        message: `Transición inválida. No se puede cambiar el estado de ${currentStatus} a ${status}.` 
      }, { status: 409 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error("Error al actualizar estado de orden:", error);
    return NextResponse.json({ 
      code: "INTERNAL_SERVER_ERROR", 
      message: "Error interno del servidor." 
    }, { status: 500 });
  }
}
