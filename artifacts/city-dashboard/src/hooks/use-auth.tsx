import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("cityos_admin_user");
    return saved ? JSON.parse(saved) : null;
  });

  const loginAsGuest = () => {
    const guestUser = { id: "admin-1", name: "City Administrator", role: "city_admin" };
    setUser(guestUser);
    localStorage.setItem("cityos_admin_user", JSON.stringify(guestUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cityos_admin_user");
  };

  return (
    <AuthContext.Provider value={{ user, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
