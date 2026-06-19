"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  role: string | null;
  email: string | null;
  login: (token: string, role: string, email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedRole = localStorage.getItem("auth_role");
    const savedEmail = localStorage.getItem("auth_email");
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedRole) {
      setRole(savedRole);
    }
    if (savedEmail) {
      setEmail(savedEmail);
    }
    setIsLoaded(true);
  }, []);

  const login = (newToken: string, userRole: string, userEmail: string) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_role", userRole);
    localStorage.setItem("auth_email", userEmail);
    setToken(newToken);
    setRole(userRole);
    setEmail(userEmail);
    
    if (userRole === "ADMIN") {
      router.push("/admin?tab=orders");
    } else {
      router.push("/");
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_email");
    setToken(null);
    setRole(null);
    setEmail(null);
    router.push("/login");
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ token, role, email, login, logout, isAuthenticated: !!token, isAdmin: role === "ADMIN" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
