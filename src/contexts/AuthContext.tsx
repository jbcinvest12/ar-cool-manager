
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

// Types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Context creation
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Effect to load current user and subscribe to authentication changes
  useEffect(() => {
    // Check if there's an authenticated user
    const getUser = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Erro ao obter usuário:", error);
          setUser(null);
        } else if (data?.user) {
          setUser(data.user);
          
          // Check if user is admin
          // For now, set to false until we implement the proper user_roles table
          setIsAdmin(false);
          
          // Later we'll implement proper admin role check like this:
          // const { data: roleData } = await supabase
          //   .from('user_roles')
          //   .select('*')
          //   .eq('user_id', data.user.id)
          //   .eq('role', 'admin')
          //   .single();
          // setIsAdmin(!!roleData);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Subscribe to authentication changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // For now, set isAdmin to false until we implement the proper role check
        setIsAdmin(false);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    // Cleanup on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Login function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Erro no login:", error.message);
      toast({
        title: t('auth.login_error'),
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Registration function
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('auth.signup_success'),
        description: t('auth.check_email'),
      });
    } catch (error: any) {
      console.error("Erro no cadastro:", error.message);
      toast({
        title: t('auth.signup_error'),
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Erro ao sair:", error.message);
      toast({
        title: t('auth.logout_error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Password reset function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('auth.reset_password'),
        description: t('auth.check_email_reset'),
      });
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error.message);
      toast({
        title: t('auth.reset_error'),
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
