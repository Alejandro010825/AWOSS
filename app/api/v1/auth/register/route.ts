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
        code: "INVALID_INPUT",
        message: "El email y la contraseña son requeridos."
      }, { status: 400 });
    }

    // Verificar si el correo ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        code: "EMAIL_ALREADY_IN_USE",
        message: "El correo electrónico ya está en uso."
      }, { status: 409 });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario con rol CLIENT por defecto
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "CLIENT"
      }
    });

    // Firmar el token JWT para iniciar sesión automáticamente
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({ id: newUser.id, email: newUser.email, role: newUser.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    const response = NextResponse.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error inesperado al registrar la cuenta."
    }, { status: 500 });
  }
}
