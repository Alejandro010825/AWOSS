import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const userPayload = await getUserFromRequest(request);

  if (!userPayload) {
    return NextResponse.json({
      code: "AUTH_TOKEN_MISSING_OR_INVALID",
      message: "Credenciales ausentes, firma de token expirada o inválida.",
      details: [{ field: "Authorization", rule: "required_bearer_token" }]
    }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userPayload.id }
    });

    if (user) {
      return NextResponse.json(user, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({
      code: "INTERNAL_ERROR",
      message: "Error al recuperar el usuario.",
      details: []
    }, { status: 500 });
  }

  return NextResponse.json({
    code: "AUTH_TOKEN_MISSING_OR_INVALID",
    message: "El token enviado no es válido o el usuario no existe.",
    details: []
  }, { status: 401 });
}

