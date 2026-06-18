import * as jose from 'jose';

export interface JWTPayload {
  id: string;
  role: string;
}

/**
 * Obtiene y valida el usuario desde las cabeceras de la petición.
 * Retorna un objeto con id y role si es válido, o null en caso contrario.
 */
export async function getUserFromRequest(req: Request): Promise<JWTPayload | null> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    return {
      id: payload.id as string,
      role: payload.role as string,
    };
  } catch (error) {
    // Retorna null si el token expiró, es inválido o tiene una firma incorrecta
    return null;
  }
}
