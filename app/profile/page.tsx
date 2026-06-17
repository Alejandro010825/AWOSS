"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/v1/users/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "Error al obtener perfil");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, token, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          <p><strong>Error:</strong> {error}</p>
          <p className="text-sm mt-2">
            (Si ves este error, es porque el API backend aún valida un token real o no encuentra este token en la DB. Espera a que la ruta de login real esté terminada.)
          </p>
        </div>
      )}

      {!loading && profile && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">ID de Usuario</p>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded mt-1">{profile.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Correo Electrónico</p>
              <p className="text-gray-900 text-lg">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Rol</p>
              <span className="inline-block mt-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {profile.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
