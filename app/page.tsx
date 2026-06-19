"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

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
  

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const limit = 8;
        const url = new URL('/api/v1/products', window.location.origin);
        url.searchParams.append('page', currentPage.toString());
        url.searchParams.append('limit', limit.toString());
        if (searchQuery) {
          url.searchParams.append('search', searchQuery);
        }

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Error al obtener los productos");
        
        const json = await response.json();
        
        if (json.data && json.meta) {
          setProducts(json.data);
          setTotalPages(json.meta.totalPages || 1);
        } else if (Array.isArray(json)) {
          setProducts(json);
          setTotalPages(1);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery]);

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <section className="relative overflow-hidden bg-indigo-900 text-white py-20 lg:py-28 rounded-b-[3rem] shadow-xl mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-4 text-center z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-sm font-semibold tracking-wider mb-6 backdrop-blur-sm">
            NUEVA COLECCIÓN
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Encuentra los Mejores <br className="hidden md:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
              Productos para Ti
            </span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100/80 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
            Explora nuestro catálogo con la mejor selección de artículos para el hogar, moda, tecnología y mucho más. Todo en un solo lugar.
          </p>
        </div>
      </section>


      <main className="max-w-6xl mx-auto px-4 pb-24">
        

        <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight whitespace-nowrap">Nuestro Catálogo</h2>
          
          <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative">
            <input 
              type="text" 
              placeholder="Buscar audífonos, teclados..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-5 pr-12 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium text-slate-700 transition"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
              aria-label="Buscar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </form>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <p className="text-indigo-600 font-medium">Cargando catálogo...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl max-w-lg mx-auto text-center border border-red-100 shadow-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-slate-700 mb-1">No hay resultados</p>
            <p className="text-sm font-medium">No se encontraron productos para "{searchQuery}".</p>
            {searchQuery && (
              <button 
                onClick={() => { setSearchInput(""); setSearchQuery(""); setCurrentPage(1); }}
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                Limpiar Búsqueda
              </button>
            )}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {products.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1">
                  

                  <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden group-hover:from-indigo-50 group-hover:to-purple-50 transition-colors">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 transform group-hover:scale-110 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    {product.inStock ? (
                      <span className="absolute top-4 right-4 text-[10px] text-teal-700 font-bold px-2.5 py-1 rounded-full border border-teal-200 bg-teal-50/90 backdrop-blur-sm shadow-sm">
                        EN STOCK
                      </span>
                    ) : (
                      <span className="absolute top-4 right-4 text-[10px] text-rose-700 font-bold px-2.5 py-1 rounded-full border border-rose-200 bg-rose-50/90 backdrop-blur-sm shadow-sm">
                        AGOTADO
                      </span>
                    )}
                  </div>
                  

                  <div className="p-5 flex-grow flex flex-col">
                    {product.category && (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 mb-2 block">
                        {product.category.name}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex flex-col gap-4">
                      <div className="text-2xl font-black text-slate-900">
                        ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </div>

                      <button 
                        disabled={!product.inStock}
                        onClick={() => handleAddToCart(product)}
                        className={`w-full py-2.5 px-4 text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold shadow-sm ${
                          product.inStock 
                            ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 text-white' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {product.inStock ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            Agregar a la Orden
                          </>
                        ) : 'Sin Stock Disponible'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>


            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 max-w-xs mx-auto">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-xl transition ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                  aria-label="Página anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                
                <span className="font-bold text-slate-700">
                  Página <span className="text-indigo-600">{currentPage}</span> de {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-xl transition ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                  aria-label="Página siguiente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
