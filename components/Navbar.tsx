"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { isAuthenticated, isAdmin, email, logout } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="bg-white text-slate-800 p-4 shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
          <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-xs font-bold tracking-wider">AS</span>
          AllShop
        </Link>
        <div className="flex gap-6 items-center font-medium">
          {isAdmin ? (
            <>
              <Link href="/admin?tab=orders" className="hover:text-indigo-600 transition font-semibold">
                Gestión de Órdenes
              </Link>
              <Link href="/admin?tab=products" className="hover:text-indigo-600 transition font-semibold">
                Catálogo
              </Link>
              <Link href="/admin?tab=users" className="hover:text-indigo-600 transition font-semibold">
                Usuarios
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-indigo-600 transition font-semibold">Catálogo</Link>
              {isAuthenticated && (
                <>
                  <Link href="/orders" className="hover:text-indigo-600 transition font-semibold">Mis Órdenes</Link>
                  <Link href="/cart" className="hover:text-indigo-600 transition flex items-center gap-1.5 font-semibold">
                    Carrito
                    {totalItems > 0 && (
                      <span className="bg-indigo-600 text-white rounded-full text-[10px] font-bold px-2 py-0.5 shadow-sm">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6 ml-2">
              <span className="text-sm text-slate-500 hidden md:block">
                {email || 'Usuario'}
              </span>
              <button 
                onClick={logout}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-full transition text-sm font-semibold"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="border-l border-slate-200 pl-6 ml-2">
              <Link href="/login" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm px-4 py-1.5 rounded-full transition text-sm font-semibold">
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
