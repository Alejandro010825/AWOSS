"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="bg-white text-slate-800 p-4 shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
          <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-xs font-bold tracking-wider">AS</span>
          AllShop
        </Link>
        <div className="flex gap-6 items-center font-medium">
          <Link href="/" className="hover:text-indigo-600 transition">Catálogo</Link>
          <Link href="/cart" className="hover:text-indigo-600 transition flex items-center gap-1.5">
            Mi Orden
            {totalItems > 0 && (
              <span className="bg-indigo-600 text-white rounded-full text-xs font-bold px-2 py-0.5 shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="hover:text-indigo-600 transition">Mi Perfil</Link>
              <button 
                onClick={logout}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-full transition text-sm font-semibold"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm px-4 py-1.5 rounded-full transition text-sm font-semibold">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
