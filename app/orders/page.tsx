"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Product = { name: string };
type OrderItem = { quantity: number; unitPrice: number; product: Product };
type Order = {
  id: string;
  folio: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function MyOrdersPage() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchOrders = async () => {
        try {
          const response = await fetch("/api/v1/orders", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error("Error al obtener el historial de órdenes");
          }
          
          const data = await response.json();
          setOrders(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PROCESANDO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ENVIADO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ENTREGADO': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELADO': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
          Mis Órdenes
        </h1>
        <p className="text-slate-500 font-medium">
          Sigue el progreso de tus compras y revisa tu historial.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-indigo-600 font-medium">Cargando tu historial...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl max-w-lg mx-auto text-center border border-red-100 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aún no has comprado nada</h3>
          <p className="text-slate-500 mb-8">Tus órdenes aparecerán aquí una vez que realices tu primera compra.</p>
          <Link href="/" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-700 transition shadow-sm">
            Explorar Catálogo
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
              <div className="border-b border-slate-100 bg-slate-50 p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Orden realizada el {new Date(order.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="font-bold text-slate-800">
                    Pedido <span className="text-indigo-600">#{order.folio}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-slate-500 font-medium mb-1">Total Pagado</p>
                    <p className="font-black text-slate-900">${order.total.toFixed(2)}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border text-xs font-black tracking-wider uppercase ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Artículos en esta orden</h4>
                <ul className="space-y-3">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded text-xs">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-slate-700">{item.product.name}</span>
                      </div>
                      <span className="font-semibold text-slate-600">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between md:hidden">
                  <span className="font-bold text-slate-700">Total:</span>
                  <span className="font-black text-slate-900">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
