"use client";

import { useEffect, useState } from "react";
<<<<<<< HEAD
import Link from "next/link";
import { useCart } from "@/context/CartContext";
=======
>>>>>>> d418d50 (configuracion de prisma y env)

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
<<<<<<< HEAD
  
  const { addToCart } = useCart();
=======
>>>>>>> d418d50 (configuracion de prisma y env)

  const uniqueCategories = Array.from(new Set(products.map(p => p.category?.name))).filter(Boolean) as string[];
  const filteredProducts = selectedCategory === 'all' ? products : products.filter(p => p.category?.name === selectedCategory);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/v1/products');
        if (!response.ok) throw new Error("Error al obtener los productos");
        
        const json = await response.json();
        setProducts(json.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
<<<<<<< HEAD
    <div>
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Catálogo de Productos
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl">
          Explora nuestra selección de artículos disponibles y agrégalos a tu carrito.
        </p>
      </header>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
          No hay productos disponibles por el momento.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="mb-8 bg-white p-4 rounded-lg shadow-sm inline-block border border-gray-100">
            <label htmlFor="category-filter" className="block text-sm font-bold text-gray-700 mb-2">
              Filtrar por categoría:
            </label>
            <select 
              id="category-filter" 
              className="block w-full min-w-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
=======
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <header className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Nuestra Tienda
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Explora nuestra selección de artículos disponibles.
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No hay productos disponibles por el momento.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="mb-6">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">Filtrar por categoría:</label>
            <select 
              id="category-filter" 
              className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
>>>>>>> d418d50 (configuracion de prisma y env)
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
<<<<<<< HEAD

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex flex-col border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                  <span className="text-4xl text-gray-300">📦</span>
                </div>
                
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    {product.category && (
                      <span className="text-xs font-semibold tracking-wide uppercase text-indigo-500 mb-1 block">
                        {product.category.name}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                      {product.name}
                    </h3>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-gray-900">
                        ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inStock ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                      <button 
                        disabled={!product.inStock}
                        onClick={() => addToCart({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1
                        })}
                        className={`w-full py-2 px-4 rounded-md font-semibold text-white transition ${
                          product.inStock 
                            ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800' 
                            : 'bg-gray-300 cursor-not-allowed text-gray-500'
                        }`}
                      >
                        {product.inStock ? 'Agregar al Carrito' : 'Sin Stock'}
                      </button>
                      <Link 
                        href={`/products/${product.id}`}
                        className="w-full text-center py-2 px-4 rounded-md font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
=======
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border border-gray-300 p-4 rounded-md bg-white">
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-gray-700 mb-2">
                Precio: ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm mb-4">
                Estado: {product.inStock ? 'Disponible' : 'Agotado'}
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
                Comprar
              </button>
            </div>
          ))}
        </div>
      </main>
>>>>>>> d418d50 (configuracion de prisma y env)
    </div>
  );
}
