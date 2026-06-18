import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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
