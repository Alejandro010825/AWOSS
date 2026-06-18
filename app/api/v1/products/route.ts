import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth'; // 1. Importamos el helper seguro

export async function POST(request: Request) {
  try {
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
        message: "Solo administradores pueden crear productos." 
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, price, description, categoryId, stock } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ message: "Campos obligatorios faltantes" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        stock: stock ? parseInt(stock) : 0,
        categoryId
      }
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ 
      code: "INTERNAL_SERVER_ERROR", 
      message: "Error interno del servidor." 
    }, { status: 500 });
  }
}