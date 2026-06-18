# Guía de Migración: Autenticación con JWT (jose) y Prisma

Esta guía detalla el plan paso a paso para reemplazar el sistema de tokens "hardcodeados" actual por un sistema de autenticación seguro basado en JSON Web Tokens (JWT) utilizando la librería `jose`.

---

## 🛠️ Requisitos e Instalación

Instalaremos `jose` para la gestión de tokens JWT y `bcryptjs` para el hash y comparación segura de contraseñas:

```bash
npm install jose bcryptjs
npm install -D @types/bcryptjs
```

Asegúrate de agregar la clave secreta al archivo `.env` del proyecto:

```env
JWT_SECRET=tu_firma_secreta_super_segura_de_al_menos_256_bits
```

---

## 💻 Código Base Recomendado

### 1. Helper de Autenticación: `lib/auth.ts`
Este archivo contiene la lógica para verificar el token recibido en la cabecera `Authorization` de las peticiones HTTP.

```typescript
import { NextRequest } from 'next/server';
import * as jose from 'jose';

// Interfaz para el contenido del token
export interface JWTPayload {
  id: string;
  role: string;
}

/**
 * Obtiene y valida el usuario desde las cabeceras de la petición.
 * Retorna un objeto con id y role si es válido, o null en caso contrario.
 */
export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
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
```

---

### 2. Ruta de Login (Generador de Tokens): `app/api/v1/auth/login/route.ts`
Este endpoint autentica a un usuario por correo electrónico y retorna su JWT.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jose from 'jose';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      const missingField = !email ? "email" : "password";
      return NextResponse.json({
        code: "VALIDATION_FAILED",
        message: `El campo ${missingField} es requerido.`,
        details: [{ field: missingField, rule: "required" }]
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

    // Verificar la contraseña cifrada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
      message: "JSON mal formado o error en la petición.",
      details: []
    }, { status: 422 });
  }
}
```

---

## 🔀 Plan de Tareas Dividido (50% / 50%)

Para facilitar el trabajo en paralelo y evitar conflictos al fusionar el código (`git merge`), dividan el proyecto así:

### 👤 Desarrollador A: Core & Login

1. **Instalación y Variables de Entorno**
   - Ejecutar `npm install jose bcryptjs` y `npm install -D @types/bcryptjs`.
   - Crear el archivo `.env` en la raíz (si no existe) y configurar `JWT_SECRET`.
2. **Crear Helper de Autenticación**
   - Crear el archivo `lib/auth.ts` con el código base proporcionado arriba.
3. **Implementar Endpoint de Login con Contraseña**
   - Crear `app/api/v1/auth/login/route.ts` que valide el correo y verifique el hash de la contraseña usando `bcrypt.compare`.
4. **Proteger Perfil de Usuario (`app/api/v1/users/me/route.ts`)**
   - Importar el helper `getUserFromRequest`.
   - Limpiar el mock de `admin-token` / `client-token-`.
   - Retornar la información del usuario de la base de datos basándose en el ID del token verificado.

---

### 👤 Desarrollador B: Protección de Endpoints del Negocio

*(Nota: Este desarrollador depende de que el Desarrollador A cree y comparta el archivo `lib/auth.ts` o puede crearlo de forma temporal en su rama para trabajar).*

1. **Proteger Ruta de Productos (`app/api/v1/products/route.ts`)**
   - Importar `getUserFromRequest` en el endpoint `POST`.
   - Validar que exista un token válido.
   - Validar que el rol sea exactamente `'ADMIN'`. Si no, retornar error `403` (`INSUFFICIENT_PERMISSIONS`).
2. **Proteger Creación de Órdenes (`app/api/v1/orders/route.ts`)**
   - En el endpoint `POST`, extraer el usuario mediante `getUserFromRequest`.
   - Eliminar la obtención de `body.customerId`.
   - Guardar la orden en Prisma usando el ID real del token: `customerId: user.id`.
3. **Proteger Consulta de Orden Individual (`app/api/v1/orders/[id]/route.ts`)**
   - En el endpoint `GET`, verificar que el usuario autenticado sea el dueño de la orden (`user.id === order.customerId`) o que tenga rol de `'ADMIN'`. De lo contrario, retornar error `403`.
4. **Proteger Cambio de Estado de Órdenes (`app/api/v1/orders/[id]/status/route.ts`)**
   - En la ruta `PATCH`, validar que el usuario tenga rol de `'ADMIN'`. De lo contrario, retornar error `403`.

---

## 🧪 Pruebas de Integración y Flujo

1. **Crear un Usuario en la Base de Datos:**
   Asegúrate de tener al menos un usuario registrado en tu base de datos de PostgreSQL con un rol asignado (`CLIENT` o `ADMIN`).
2. **Iniciar Sesión:**
   Envía una petición `POST` a `/api/v1/auth/login` con el JSON `{ "email": "usuario@ejemplo.com", "password": "mi_password_seguro" }`. Deberás recibir el `{ "token": "..." }`.
3. **Probar un endpoint protegido:**
   Realiza peticiones a tus rutas protegidas enviando la cabecera HTTP:
   `Authorization: Bearer <TU_TOKEN_JWT_AQUI>`.
