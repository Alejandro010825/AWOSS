"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Category = { id: string; name: string };
type Product = { id: string; name: string; price: number; inStock: boolean; category: Category };
type Order = { id: string; folio: string; customerId: string; total: number; status: string; createdAt: string; user: { email: string }; items: any[] };
type User = { id: string; email: string; role: string; createdAt: string };

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, token, email } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeTab = searchParams.get("tab") || "orders";

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", categoryId: "", inStock: true });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");


  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'ORDER' | 'PRODUCT' | null;
    id: string;
    newValue: any;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    id: "",
    newValue: null,
    title: "",
    message: ""
  });


  const [stockFilter, setStockFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/");
    }
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin && token) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resOrders, resProducts, resCategories, resUsers] = await Promise.all([
        fetch("/api/v1/orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/v1/products"),
        fetch("/api/v1/categories"),
        fetch("/api/v1/users", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (resOrders.ok) setOrders(await resOrders.json());
      if (resProducts.ok) {
        const pData = await resProducts.json();
        setProducts(pData.data);
      }
      if (resCategories.ok) {
        const cData = await resCategories.json();
        setCategories(cData.data || []);
      }
      if (resUsers.ok) setUsers(await resUsers.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    try {
      const res = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al crear producto");
      }
      setFormSuccess("¡Producto creado exitosamente!");
      setNewProduct({ name: "", price: "", categoryId: "", inStock: true });
      fetchData(); 
      
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess("");
      }, 1500);
      
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  const executeConfirmAction = async () => {
    try {
      if (confirmModal.type === 'ORDER') {
        const res = await fetch(`/api/v1/orders/${confirmModal.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: confirmModal.newValue })
        });
        if (!res.ok) throw new Error("Error actualizando la orden");
      } else if (confirmModal.type === 'PRODUCT') {
        const res = await fetch(`/api/v1/products/${confirmModal.id}/stock`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ inStock: confirmModal.newValue })
        });
        if (!res.ok) throw new Error("Error actualizando el stock");
      }
      
      await fetchData(); 
    } catch (error) {
      console.error("Error en la actualización:", error);
      alert("Hubo un error al ejecutar la acción.");
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const filteredProducts = products.filter(p => {
    if (stockFilter === "IN_STOCK" && !p.inStock) return false;
    if (stockFilter === "OUT_OF_STOCK" && p.inStock) return false;
    if (categoryFilter !== "ALL" && p.category?.id !== categoryFilter) return false;
    return true;
  });

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 mb-20 relative">
      <h1 className="text-3xl font-black text-slate-900 mb-8">
        {activeTab === 'orders' ? 'Gestión de Órdenes' : activeTab === 'users' ? 'Directorio de Usuarios' : 'Catálogo y Productos'}
      </h1>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Cargando información segura del servidor...</div>
      ) : activeTab === "orders" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No hay órdenes registradas todavía.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Orden / Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Oficial</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado de Logística</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-indigo-600 uppercase">#{order.folio}</div>
                        <div className="text-sm text-gray-500">{order.user?.email || 'Usuario Desconocido'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-black">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            setConfirmModal({
                              isOpen: true,
                              type: 'ORDER',
                              id: order.id,
                              newValue: e.target.value,
                              title: "Confirmar Cambio de Logística",
                              message: `Estás a punto de cambiar el estado de la orden a "${e.target.value}". ¿Deseas continuar?`
                            });
                          }}
                          className="text-sm font-semibold rounded-md border-gray-300 px-3 py-1.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="PENDIENTE">PENDIENTE</option>
                          <option value="PROCESANDO">PROCESANDO</option>
                          <option value="ENVIADO">ENVIADO</option>
                          <option value="ENTREGADO">ENTREGADO</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === "users" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden w-full">
          {users.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No hay usuarios registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email del Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol de Acceso</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.filter(u => u.email !== email).map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {u.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {new Date(u.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-md hover:bg-indigo-700 transition shadow-sm"
            >
              + Nuevo Producto
            </button>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-600">Categoría:</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">Todas</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-600">Stock:</label>
                <select 
                  value={stockFilter} 
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">Todos</option>
                  <option value="IN_STOCK">Disponibles</option>
                  <option value="OUT_OF_STOCK">Agotados</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden w-full">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No se encontraron productos con estos filtros.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Precio al Público</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Disponibilidad</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-800">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                          {product.category?.name || 'General'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 font-black">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={product.inStock ? "true" : "false"}
                            onChange={(e) => {
                              const isAvailable = e.target.value === "true";
                              setConfirmModal({
                                isOpen: true,
                                type: 'PRODUCT',
                                id: product.id,
                                newValue: isAvailable,
                                title: "Confirmar Cambio de Inventario",
                                message: `¿Estás seguro de marcar el producto como "${isAvailable ? 'Disponible' : 'Agotado'}" en el catálogo público?`
                              });
                            }}
                            className={`text-sm font-semibold rounded-md px-3 py-1.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer ${
                              product.inStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            <option value="true">Disponible</option>
                            <option value="false">Agotado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-slate-800">Agregar Producto Nuevo</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {formError && <div className="bg-red-50 text-red-700 text-sm p-4 rounded-md mb-6 font-medium border border-red-100">{formError}</div>}
              {formSuccess && <div className="bg-green-50 text-green-700 text-sm p-4 rounded-md mb-6 font-medium border border-green-100">{formSuccess}</div>}
              
              <form onSubmit={handleCreateProduct} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Comercial</label>
                  <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="Ej. Audífonos Bluetooth" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio Unitario ($)</label>
                  <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required min="0.01" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                  <select value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                    <option value="">Selecciona una opción...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 rounded-md hover:bg-gray-50 transition shadow-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-md hover:bg-indigo-700 transition shadow-sm">
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{confirmModal.title}</h3>
              <p className="text-slate-600 text-center text-sm font-medium mb-6">
                {confirmModal.message}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-md hover:bg-gray-50 transition shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeConfirmAction}
                  className="flex-1 bg-amber-500 text-white font-bold py-2 rounded-md hover:bg-amber-600 transition shadow-sm"
                >
                  Sí, Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
