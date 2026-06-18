"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  category?: { id: string; name: string };
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { addToCart } = useCart();

  const uniqueCategories = Array.from(new Set(products.map(p => p.category?.name))).filter(Boolean) as string[];
  const filteredProducts = selectedCategory === 'all' ? products : products.filter(p => p.category?.name === selectedCategory);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/v1/products');
        if (!response.ok) throw new Error("Error al obtener los productos");
        
        const json = await response.json();
        setProducts(Array.isArray(json) ? json : json.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="py-6">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Catálogo de Productos
        </h1>
        <p className="text-slate-500">
          Explora la mejor tecnología en AllShop.
        </p>
      </header>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg max-w-lg mx-auto text-center border border-red-100">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16 text-slate-500 bg-white rounded-lg border border-slate-200 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm">No hay productos disponibles por el momento.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2">
              <label htmlFor="category-filter" className="text-sm text-slate-600">
                Filtrar:
              </label>
              <select 
                id="category-filter" 
                className="bg-white text-sm text-slate-800 px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
                <div className="h-40 bg-slate-50 flex items-center justify-center relative border-b border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {product.inStock ? (
                    <span className="absolute top-3 right-3 text-[10px] text-green-700 font-medium px-2 py-0.5 rounded border border-green-200 bg-green-50">
                      Disponible
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 text-[10px] text-red-700 font-medium px-2 py-0.5 rounded border border-red-200 bg-red-50">
                      Agotado
                    </span>
                  )}
                </div>
                
                <div className="p-4 flex-grow flex flex-col">
                  {product.category && (
                    <span className="text-[10px] uppercase text-slate-400 mb-1 block">
                      {product.category.name}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-4">
                    <div className="text-xl font-bold text-slate-900 mb-4">
                      ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        disabled={!product.inStock}
                        onClick={() => addToCart({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1
                        })}
                        className={`w-full py-2 px-3 text-sm rounded transition-colors flex items-center justify-center gap-2 font-medium ${
                          product.inStock 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {product.inStock ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            Agregar a la Orden
                          </>
                        ) : 'Sin Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
