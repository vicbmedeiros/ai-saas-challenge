import {
    createContext,
    useContext,
    useState,
    type ReactNode,
  } from "react";
  
  type User = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    companyId: string;
  };
  
  type AuthContextType = {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
  };
  
  const AuthContext = createContext<AuthContextType | null>(null);
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    });
  
    function login(token: string, user: User) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    }
  
    function logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  
    return (
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error("useAuth must be used inside AuthProvider");
    }
  
    return context;
  }