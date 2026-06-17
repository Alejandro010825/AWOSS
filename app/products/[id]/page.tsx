"use client";

import { useEffect, useState, use } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  category?: { id: string; name: string };
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/v1/products/${resolvedParams.id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Producto no encontrado (404)");
          throw new Error("Error al obtener los detalles del producto");
        }
        
        const json = await response.json();
      
        setProduct(json.data || json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [resolvedParams.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity
      });
     
      router.push("/cart");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-red-50 text-red-600 p-6 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p>{error || "No se pudo cargar el producto."}</p>
        <Link href="/" className="inline-block mt-6 text-indigo-600 underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-md overflow-hidden">
      <div className="md:flex">
      
        <div className="md:shrink-0 bg-gray-200 w-full md:w-96 h-64 md:h-auto flex items-center justify-center">
          <span className="text-gray-400 text-6xl">🛍️</span>
        </div>
        
        <div className="p-8 w-full flex flex-col justify-between">
          <div>
            {product.category && (
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">
                {product.category.name}
              </div>
            )}
            <h1 className="block mt-1 text-3xl leading-tight font-extrabold text-black">
              {product.name}
            </h1>
            <p className="mt-4 text-gray-500 text-lg">
              Descripción detallada del producto. Aquí irían las características, especificaciones y ventajas de adquirir este increíble artículo en nuestra tienda API-First.
            </p>
            
            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.inStock ? 'En Stock' : 'Agotado'}
              </span>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="flex items-center gap-4 mb-4">
              <label htmlFor="quantity" className="text-gray-700 font-medium">Cantidad:</label>
              <select 
                id="quantity" 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!product.inStock}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold text-white transition ${
                product.inStock 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {product.inStock ? 'Agregar al Carrito' : 'No disponible'}
            </button>
            <Link href="/" className="block mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
              &larr; Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
