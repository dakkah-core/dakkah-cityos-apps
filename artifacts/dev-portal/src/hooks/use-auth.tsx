import { createContext, useContext, useState, ReactNode } from "react";

type User = {
  id: string;
  name: string;
  role: "developer" | "guest";
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  loginAsDeveloper: () => void;
  loginAsGuest: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginAsDeveloper = () => {
    setUser({
      id: "dev-1",
      name: "Alex (Developer)",
      role: "developer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=38bdf8",
    });
  };

  const loginAsGuest = () => {
    setUser({
      id: "guest-1",
      name: "Guest Explorer",
      role: "guest",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest&backgroundColor=64748b",
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAsDeveloper, loginAsGuest, logout }}>
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
