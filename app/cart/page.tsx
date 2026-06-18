"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (cart.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const profileRes = await fetch("/api/v1/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!profileRes.ok) throw new Error("No se pudo obtener el perfil del usuario. Inicia sesión de nuevo.");
      const profile = await profileRes.json();

      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price
      }));

      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          customerId: profile.id,
          items 
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Error al procesar la compra");
      }

      const orderData = await response.json();
      setSuccessMsg(`¡Orden creada exitosamente! (ID: ${orderData.id})`);
      clearCart();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !successMsg) {
    return (
      <div className="max-w-4xl mx-auto mt-10 text-center py-20 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">Parece que aún no has agregado ningún producto.</p>
        <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition">
          Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Mi Orden</h1>

      {successMsg && (
        <div className="bg-green-50 text-green-800 p-6 rounded-lg mb-8 text-center border border-green-200">
          <h2 className="text-xl font-bold mb-2">¡Compra Exitosa!</h2>
          <p>{successMsg}</p>
          <Link href="/" className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
            Seguir Comprando
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          <p><strong>Error en Checkout:</strong> {error}</p>
        </div>
      )}

      {cart.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                  <p className="text-gray-500">Cantidad: {item.quantity}</p>
                  <p className="text-indigo-600 font-medium">
                    ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/u
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg mb-2">
                    ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit sticky top-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-4">Resumen de Orden</h2>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Artículos ({totalItems}):</span>
              <span>${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
              <span>Envío:</span>
              <span>Gratis</span>
            </div>
            <div className="flex justify-between mb-8 text-xl font-bold border-t pt-4">
              <span>Total:</span>
              <span>${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`w-full py-3 rounded-md font-bold text-white transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Procesando..." : "Confirmar Compra"}
            </button>
            
            {!isAuthenticated && (
              <p className="text-xs text-red-500 mt-3 text-center">
                Debes iniciar sesión para procesar la compra.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
