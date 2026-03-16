import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateId } from "@/lib/id";

const AUTH_KEY = "dakkah_auth_profile";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  xp: number;
  xpToNext: number;
  walletBalance: number;
  currency: string;
  language: "en" | "ar";
  placesVisited: number;
  favorites: number;
  joinedDate: string;
}

const DEFAULT_PROFILE: UserProfile = {
  id: "user_default",
  displayName: "Explorer",
  email: "",
  avatar: undefined,
  tier: "Gold",
  xp: 4500,
  xpToNext: 5000,
  walletBalance: 1250.0,
  currency: "SAR",
  language: "en",
  placesVisited: 47,
  favorites: 12,
  joinedDate: "2025-06-15",
};

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (name: string, email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY)
      .then((data) => {
        if (data) {
          const parsed = JSON.parse(data);
          setUser(parsed);
        } else {
          setUser(DEFAULT_PROFILE);
          AsyncStorage.setItem(AUTH_KEY, JSON.stringify(DEFAULT_PROFILE)).catch(() => {});
        }
      })
      .catch(() => {
        setUser(DEFAULT_PROFILE);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (name: string, email: string) => {
    const profile: UserProfile = {
      ...DEFAULT_PROFILE,
      id: generateId("user"),
      displayName: name,
      email,
    };
    setUser(profile);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(profile)).catch(() => {});
  }, []);

  const signOut = useCallback(async () => {
    setUser(DEFAULT_PROFILE);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(DEFAULT_PROFILE)).catch(() => {});
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && user.id !== "user_default", isLoading, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
