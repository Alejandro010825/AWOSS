import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jose from 'jose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No autorizado. Token faltante." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    let decoded;
    try {
      const { payload } = await jose.jwtVerify(token, secret);
      decoded = payload;
    } catch {
      return NextResponse.json({ message: "Token inválido o expirado." }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Acceso denegado. Se requiere rol de administrador." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { inStock } = body; 

    if (typeof inStock !== "boolean") {
      return NextResponse.json({ message: "Formato inválido. 'inStock' debe ser booleano." }, { status: 400 });
    }

    const currentProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!currentProduct) {
      return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { inStock }
    });

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error("Error updating product stock:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
