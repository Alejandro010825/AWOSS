import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jose from 'jose';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        code: "VALIDATION_FAILED",
        message: "El correo electrónico es requerido.",
        details: [{ field: "email", rule: "required" }]
      }, { status: 422 });
    }

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({
        code: "AUTH_TOKEN_MISSING_OR_INVALID",
        message: "Credenciales inválidas o el usuario no existe.",
        details: []
      }, { status: 401 });
    }

    // Firmar el token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ id: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h') // Válido por 2 horas
      .sign(secret);

    return NextResponse.json({ token }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      code: "VALIDATION_FAILED",
      message: "JSON mal formado.",
      details: []
    }, { status: 422 });
  }
}
