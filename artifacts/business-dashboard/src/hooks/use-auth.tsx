import { createContext, useContext, useState, ReactNode } from "react";

type User = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
} | null;

interface AuthContextType {
  user: User;
  isLoading: boolean;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Check session storage for simple persistence
  const [user, setUser] = useState<User>(() => {
    const saved = sessionStorage.getItem("dakkah_auth");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginAsGuest = () => {
    setIsLoading(true);
    setTimeout(() => {
      const guestUser = {
        id: "gst_" + Math.random().toString(36).substring(2, 9),
        name: "Demo Merchant",
        role: "business_owner",
        avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=merchant",
      };
      setUser(guestUser);
      sessionStorage.setItem("dakkah_auth", JSON.stringify(guestUser));
      setIsLoading(false);
    }, 600);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("dakkah_auth");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAsGuest, logout }}>
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
