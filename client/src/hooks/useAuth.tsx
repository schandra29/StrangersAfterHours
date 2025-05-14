import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Create authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessCode: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  
  // Check authentication status
  const { data: authStatus, refetch } = useQuery<{ isAuthenticated: boolean }>({
    queryKey: ['/api/auth/status'],
    enabled: true,
  });
  
  useEffect(() => {
    setIsLoading(false);
  }, [authStatus]);
  
  // Login function
  const login = async (accessCode: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await refetch(); // Refresh auth status
        queryClient.invalidateQueries(); // Invalidate queries that might depend on auth
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      await refetch(); // Refresh auth status
      queryClient.invalidateQueries(); // Invalidate queries that might depend on auth
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!authStatus?.isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}