
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userDetails: {
    username: string;
    email: string;
    joinDate: string;
  } | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userDetails, setUserDetails] = useState<AuthContextValue['userDetails']>(null);
  const navigate = useNavigate();

  // Function to fetch user details from the database
  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, email, created_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user details:', error);
        return;
      }

      if (data) {
        // Format the date to be more readable
        const joinDate = new Date(data.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        setUserDetails({
          username: data.username,
          email: data.email,
          joinDate
        });

        // Also store in localStorage for other components
        localStorage.setItem('user_data', JSON.stringify({
          username: data.username,
          email: data.email,
          joinDate
        }));
      }
    } catch (error) {
      console.error('Error in fetchUserDetails:', error);
    }
  };

  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    // Set up auth state listener first
    const setupAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state changed:', event, newSession?.user?.email);
          
          // Important: Do synchronous state updates first
          setSession(newSession);
          setUser(newSession?.user || null);
          
          // Then do async operations with setTimeout to prevent deadlocks
          if (newSession?.user) {
            setTimeout(async () => {
              try {
                // Check if user is admin
                const { data: adminData, error: adminError } = await supabase.rpc('is_admin');
                if (!adminError && adminData) {
                  setIsAdmin(adminData);
                }
                
                // Fetch user details
                await fetchUserDetails(newSession.user.id);
              } catch (error) {
                console.error('Error in auth state change handler:', error);
              } finally {
                setIsLoading(false);
              }
            }, 0);
          } else {
            setIsAdmin(false);
            setUserDetails(null);
            setIsLoading(false);
          }
        }
      );
      
      return data;
    };
    
    // Get initial session
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        // Set synchronous states first
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Then do async operations
        if (data.session?.user) {
          // Check if user is admin and fetch user details
          const { data: adminData, error: adminError } = await supabase.rpc('is_admin');
          if (!adminError && adminData) {
            setIsAdmin(adminData);
          }
          
          // Fetch user details for profile
          await fetchUserDetails(data.session.user.id);
        }
      } catch (error) {
        console.error('Error in initial auth effect:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Setup the auth listener first, then get the initial session
    authListener = setupAuthListener();
    getInitialSession();

    // Cleanup function
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
  
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
  
      console.log('Sign in successful:', data);
      toast.success('Signed in successfully!');
  
      // Fetch the user data
      const { data: userData, error: userError } = await supabase
        .from('users') // Replace 'users' with your actual table name
        .select('is_admin')
        .eq('user_id', data.user.id) // Assuming `data.user.id` exists
        .single();
  
      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }
  
      const redirectPath = userData?.is_admin ? '/admin' : '/dashboard';
  
      // Use setTimeout to ensure navigation happens after state updates
      setTimeout(() => {
        navigate(redirectPath);
      }, 100);
      
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(`Error signing in: ${error.message}`);
    }
  };
  
  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('Signing up with:', email, username);
      // Special handling for the admin account
      const isAdminSignup = email === 'sunnydaesgroup@gmail.com';
      
      // Create the account with direct sign-in (no email verification)
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username,
            is_admin: isAdminSignup // Include is_admin in metadata for the known admin email
          },
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      console.log('Sign up data:', data);
      
      // Sign in directly after signup
      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) throw signInError;
        
        if (isAdminSignup) {
          toast.success('Admin account created and logged in successfully!');
        } else {
          toast.success('Account created and logged in successfully!');
        }
        
        // Use setTimeout to ensure navigation happens after state updates
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(`Error signing up: ${error.message}`);
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all auth-related state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setUserDetails(null);
      localStorage.removeItem('user_data');
      
      toast.info('Signed out successfully');
      
      // Use setTimeout to ensure navigation happens after state updates
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(`Error signing out: ${error.message}`);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    userDetails
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
