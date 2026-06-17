"use client";

import { useEffect, useState } from "react";

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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
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
    </div>
  );
}
