import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({
        code: "RESOURCE_NOT_FOUND",
        message: "El identificador único provisto en la ruta no corresponde a ningún elemento del servidor.",
        details: [{ field: "id", rule: "not_found" }]
      }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch {
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Error.", details: [] }, { status: 500 });
  }
}
