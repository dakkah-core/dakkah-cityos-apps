import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  role: "citizen" | "guest";
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loginAsGuest: () => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loginAsGuest: () =>
        set({
          user: {
            id: "guest_" + Math.random().toString(36).substr(2, 9),
            name: "Citizen Guest",
            role: "guest",
          },
          isAuthenticated: true,
        }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "smart-city-auth",
    }
  )
);
