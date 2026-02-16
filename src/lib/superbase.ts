import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/config/env";

// Create the Supabase client
export const supabase = createClient(
  getRequiredEnv("VITE_SUPABASE_URL"),
  getRequiredEnv("VITE_SUPABASE_ANON_KEY"),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supabase-auth',
      storage: window.localStorage,
    },
  }
);

// Auth helper functions
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
};

export const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  
  if (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
  
  return session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    return false;
  }
  
  return true;
};

// Setup auth state listener
export const setupAuthListener = (
  onAuthChange: (session: any) => void
) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth event:', event);
    
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed successfully');
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    }
    
    if (event === 'SIGNED_IN') {
      console.log('User signed in');
    }
    
    onAuthChange(session);
  });

  return subscription;
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
};