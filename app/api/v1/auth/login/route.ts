import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        code: "INVALID_CREDENTIALS",
        message: "El email y la contraseña son requeridos."
      }, { status: 400 });
    }


    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({
        code: "AUTH_TOKEN_MISSING_OR_INVALID",
        message: "Credenciales inválidas o el usuario no existe."
      }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        code: "AUTH_TOKEN_MISSING_OR_INVALID",
        message: "Credenciales inválidas o el usuario no existe."
      }, { status: 401 });
    }


    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Error en el login:", error);
    return NextResponse.json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error inesperado en el servidor."
    }, { status: 500 });
  }
}
