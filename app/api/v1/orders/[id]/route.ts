import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json({
      code: "AUTH_TOKEN_MISSING_OR_INVALID",
      message: "No autorizado.",
      details: []
    }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({
        code: "RESOURCE_NOT_FOUND",
        message: "La orden no existe.",
        details: [{ field: "id", rule: "not_found" }]
      }, { status: 404 });
    }

    if (token !== 'admin-token' && token !== `client-token-${order.customerId}`) {
      return NextResponse.json({
        code: "INSUFFICIENT_PERMISSIONS",
        message: "El rol vinculado al token de usuario no posee los permisos de escritura del endpoint.",
        details: [{ field: "token", rule: "not_owner_or_admin" }]
      }, { status: 403 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch {
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Error.", details: [] }, { status: 500 });
  }
}
