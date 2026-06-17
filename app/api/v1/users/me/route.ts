import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({
      code: "AUTH_TOKEN_MISSING_OR_INVALID",
      message: "Credenciales ausentes o firma de token expirada.",
      details: [{ field: "Authorization", rule: "required_bearer_token" }]
    }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  if (token === 'admin-token') {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    if (adminUser) {
      return NextResponse.json(adminUser, { status: 200 });
    }
    return NextResponse.json({ error: "No admin user found in DB" }, { status: 404 });
  }

  if (token.startsWith('client-token-')) {
    const userId = token.replace('client-token-', '');
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (user) {
        return NextResponse.json(user, { status: 200 });
      }
    } catch (error) {
      
    }
  }

  return NextResponse.json({
    code: "AUTH_TOKEN_MISSING_OR_INVALID",
    message: "El token enviado no es válido o el usuario no existe.",
    details: []
  }, { status: 401 });
}
