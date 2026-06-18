import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth'; 

export async function GET(request: NextRequest) {
  try {
    const userFromToken = await getUserFromRequest(request);

    if (!userFromToken) {
      return NextResponse.json({ 
        code: "AUTH_TOKEN_MISSING_OR_INVALID", 
        message: "Credenciales ausentes, firma de token expirada o inválida." 
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userFromToken.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        code: "USER_NOT_FOUND", 
        message: "El usuario ya no existe en la base de datos." 
      }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("Error en /api/v1/users/me:", error);
    return NextResponse.json({ 
      code: "INTERNAL_SERVER_ERROR", 
      message: "Error interno del servidor al obtener el perfil." 
    }, { status: 500 });
  }
}