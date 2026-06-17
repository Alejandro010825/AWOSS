"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="bg-indigo-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-wider">
          Tienda AWOS
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-indigo-200 transition">Catálogo</Link>
          <Link href="/cart" className="hover:text-indigo-200 transition flex items-center gap-1">
            Carrito
            {totalItems > 0 && (
              <span className="bg-white text-indigo-600 rounded-full text-xs font-bold px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="hover:text-indigo-200 transition">Mi Perfil</Link>
              <button 
                onClick={logout}
                className="bg-indigo-800 hover:bg-indigo-900 px-3 py-1 rounded transition text-sm"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded transition font-medium">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
