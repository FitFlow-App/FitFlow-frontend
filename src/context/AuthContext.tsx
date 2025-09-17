import { createContext, useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  userId: number | null;
  login: (newToken: string, newUserId: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  const [userId, setUserId] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId) : null;
  });
  const navigate = useNavigate();

  const login = (newToken: string, newUserId: number) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userId', newUserId.toString());
    setToken(newToken);
    setUserId(newUserId);
    //navigate('/dashboard'); // Redirige después de guardar todo
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
    navigate('/login'); // Asegura la redirección al logout
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
