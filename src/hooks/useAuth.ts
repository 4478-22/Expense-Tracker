import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session and user data
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user data from our users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!error && userData) {
          setUser({ id: userData.id, email: userData.email });
        } else {
          // If user doesn't exist in our table, create them
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: session.user.id, email: session.user.email! }]);
          
          if (!insertError) {
            setUser({ id: session.user.id, email: session.user.email! });
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user data from our users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (!error && userData) {
          setUser({ id: userData.id, email: userData.email });
        } else {
          // If user doesn't exist in our table, create them
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: session.user.id, email: session.user.email! }]);
          
          if (!insertError) {
            setUser({ id: session.user.id, email: session.user.email! });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Clean email input
    const cleanEmail = email.trim().toLowerCase();
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: cleanEmail, 
      password 
    });
    
    if (!error && data.user) {
      // Fetch user data from our users table
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (!fetchError && userData) {
        setUser({ id: userData.id, email: userData.email });
      }
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // Trim whitespace and convert to lowercase
    const cleanEmail = email.trim().toLowerCase();
    
    const { data, error } = await supabase.auth.signUp({ 
      email: cleanEmail, 
      password,
      options: {
        emailRedirectTo: undefined,
      }
    });
    
    if (!error && data.user) {
      // Wait a moment for the trigger to create the user record
      setTimeout(async () => {
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (!fetchError && userData) {
          setUser({ id: userData.id, email: userData.email });
        } else {
          // Fallback: create user record manually if trigger didn't work
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: data.user.id, email: data.user.email! }]);
          
          if (!insertError) {
            setUser({ id: data.user.id, email: data.user.email! });
          }
        }
      }, 1000);
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
    }
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}