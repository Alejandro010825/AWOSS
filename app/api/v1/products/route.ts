import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth'; // 1. Importamos el helper seguro

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));
  
  const skip = (page - 1) * limit;

  try {
    const where = search ? { name: { contains: search, mode: 'insensitive' } as any } : undefined;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (err) {
    console.error("Error al cargar productos:", err);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Error al cargar productos.", details: [] }, { status: 500 });
  }
}

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
    const { name, price, categoryId, inStock } = body;

    if (!name || price === undefined || price === null || !categoryId) {
      return NextResponse.json({ 
        code: "VALIDATION_FAILED",
        message: "Campos obligatorios faltantes.",
        details: [{ field: "payload", rule: "required_fields_missing" }]
      }, { status: 422 });
    }

    const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ 
        code: "VALIDATION_FAILED",
        message: "El precio debe ser mayor a 0.",
        details: [{ field: "price", rule: "minimum_value_1" }]
      }, { status: 422 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        categoryId,
        inStock: inStock ?? true
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