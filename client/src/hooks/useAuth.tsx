import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Create authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessCode: string) => Promise<{ 
    success: boolean; 
    message?: string;
    specialCode?: boolean;
    codeType?: string | null;
  }>;
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
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
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
        credentials: 'include', // Important for cookies to be sent
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Multiple attempts to ensure auth state is updated
        await refetch(); // First immediate refetch
        
        // Second refetch after a short delay
        setTimeout(async () => {
          await refetch();
          queryClient.invalidateQueries(); // Invalidate all queries
        }, 500);
        
        // Check for special access code info
        const specialCodeType = data.specialCode ? data.codeType : null;
        
        // If this is a special code, store it in localStorage to persist across page refreshes
        if (specialCodeType) {
          localStorage.setItem('specialCodeType', specialCodeType);
        }
        
        return { 
          success: true,
          specialCode: data.specialCode,
          codeType: specialCodeType
        };
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
        credentials: 'include',
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