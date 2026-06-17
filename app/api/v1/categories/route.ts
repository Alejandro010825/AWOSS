import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    
    return NextResponse.json({
      data: categories,
      meta: {
        page: 1,
        limit: categories.length || 10,
        total: categories.length,
        totalPages: 1
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({
      code: "INTERNAL_ERROR",
      message: "Ocurrió un problema al leer las categorías.",
      details: []
    }, { status: 500 });
  }
}
