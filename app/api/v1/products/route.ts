import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  try {
    const products = await prisma.product.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      include: { category: true }
    });

    return NextResponse.json({
      data: products,
      meta: {
        page: 1,
        limit: 10,
        total: products.length,
        totalPages: 1
      }
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Error al cargar productos.", details: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({
      code: "AUTH_TOKEN_MISSING_OR_INVALID",
      message: "Credenciales ausentes o firma de token expirada.",
      details: [{ field: "Authorization", rule: "required_bearer_token" }]
    }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  
  if (token !== 'admin-token') {
    return NextResponse.json({
      code: "INSUFFICIENT_PERMISSIONS",
      message: "El rol vinculado al token de usuario no posee los permisos de escritura del endpoint.",
      details: [{ field: "role", rule: "requires_admin" }]
    }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (body.price <= 0) {
      return NextResponse.json({
        code: "VALIDATION_FAILED",
        message: "Los parámetros del payload no cumplen con las reglas de negocio.",
        details: [{ field: "price", rule: "must_be_greater_than_zero" }]
      }, { status: 422 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        price: body.price,
        categoryId: body.categoryId,
        inStock: body.inStock ?? true
      }
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      code: "VALIDATION_FAILED", 
      message: "JSON mal formado o faltan campos obligatorios.",
      details: []
    }, { status: 422 });
  }
}