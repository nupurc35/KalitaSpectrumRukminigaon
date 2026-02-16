import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, setupAuthListener, isAuthenticated } from '@/lib/superbase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const subscription = setupAuthListener((session) => {
      setUser(session?.user ?? null);
      
      // Redirect to login if signed out
      if (!session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { user, loading, isAuthenticated: !!user };
};

export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  return { user, loading };
};