"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/, "");

// Helper function to set cookies
const setCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/`;
};

// Helper function to remove cookies
const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "volunteer" | "ngo" | "admin";
  phone?: string;
  ngoProfile?: {
    id?: number;
    organization_name?: string;
    registration_number?: string;
    pan_number?: string;
    office_location?: string;
    registration_file_path?: string;
    pan_file_path?: string;
    letterhead_file_path?: string;
    status?: string;
    is_verified?: boolean;
    created_at?: string;
  } | null;
  volunteerProfile?: Record<string, unknown> | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get auth data synchronously from storage
const getAuthDataSync = () => {
  if (typeof window === 'undefined') return { token: null, user: null };
  
  const storedToken = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("user");

  if (storedToken && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      return { token: storedToken, user: parsedUser };
    } catch (error) {
      return { token: null, user: null };
    }
  }
  
  return { token: null, user: null };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage synchronously
  const initialAuth = getAuthDataSync();
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [token, setToken] = useState<string | null>(initialAuth.token);
  const [isLoading, setIsLoading] = useState(false);

  // Sync cookies on mount and listen for auth changes
  useEffect(() => {
    const { token: storedToken, user: storedUser } = getAuthDataSync();
    
    if (storedToken && storedUser) {
      // Ensure cookies are set for middleware access
      setCookie("token", storedToken);
      setCookie("role", storedUser.role);
    }

    // Listen for custom auth-updated events (fired by signup/login)
    const handleAuthUpdated = () => {
      const { token: newToken, user: newUser } = getAuthDataSync();
      setToken(newToken);
      setUser(newUser);
    };

    // Also listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken" || e.key === "user") {
        handleAuthUpdated();
      }
    };

    window.addEventListener("auth-updated", handleAuthUpdated);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("auth-updated", handleAuthUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage = 'Login failed';
          try {
            if (contentType?.includes('application/json')) {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } else {
              const text = await response.text();
              errorMessage = text || `HTTP ${response.status}`;
            }
          } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // Store token and user
        const authToken = data.token || data.access_token;
        const userData: User = {
          id: data.user?.id || "",
          email: data.user?.email || email,
          name: data.user?.name || "",
          role: data.user?.role || "volunteer",
          phone: data.user?.phone,
          ngoProfile: data.user?.ngoProfile || null,
          volunteerProfile: data.user?.volunteerProfile || null,
        };

        localStorage.setItem("authToken", authToken);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Set cookies for middleware access
        setCookie("token", authToken);
        setCookie("role", userData.role);

        setToken(authToken);
        setUser(userData);
      } catch (error) {
        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        removeCookie("token");
        removeCookie("role");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint on backend
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear context state
      setUser(null);
      setToken(null);
      
      // Clear storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
      // Clear cookies
      removeCookie("token");
      removeCookie("role");
      
      // Redirect to login page
      window.location.href = "/login";
    }
  }, []);

  // Update token function
  const updateToken = useCallback((newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("authToken", newToken);
      setCookie("token", newToken);
    } else {
      localStorage.removeItem("authToken");
      removeCookie("token");
    }
    setToken(newToken);
  }, []);

  // Update user function
  const updateUser = useCallback((newUser: User | null) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setCookie("role", newUser.role);
    } else {
      localStorage.removeItem("user");
      removeCookie("role");
    }
    setUser(newUser);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    setUser: updateUser,
    setToken: updateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
