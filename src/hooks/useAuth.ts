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
    console.log('🔍 SignUp Debug - Starting signup process');
    console.log('📧 Original email:', email);
    console.log('🔒 Password length:', password.length);
    
    // Trim whitespace and convert to lowercase
    const cleanEmail = email.trim().toLowerCase();
    console.log('✨ Cleaned email:', cleanEmail);
    
    // Additional email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(cleanEmail);
    console.log('✅ Email regex validation:', isValidEmail);
    
    if (!isValidEmail) {
      console.error('❌ Email failed regex validation');
      return { error: { message: 'Invalid email format' } };
    }
    
    console.log('🚀 Sending signup request to Supabase...');
    const { data, error } = await supabase.auth.signUp({ 
      email: cleanEmail, 
      password,
      options: {
        emailRedirectTo: undefined,
      }
    });
    
    console.log('📊 Supabase signup response:');
    console.log('- Data:', data);
    console.log('- Error:', error);
    console.log('- User:', data?.user);
    console.log('- Session:', data?.session);
    
    if (!error && data.user) {
      console.log('✅ Signup successful, user created');
      console.log('👤 User ID:', data.user.id);
      console.log('📧 User email:', data.user.email);
      
      // Wait a moment for the trigger to create the user record
      setTimeout(async () => {
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        console.log('🎫 Session exists, setting user immediately');
        if (!fetchError && userData) {
        console.log('✅ User state updated successfully');
          setUser({ id: userData.id, email: userData.email });
        console.log('⏳ No session yet, waiting for user record creation...');
        } else {
          // Fallback: create user record manually if trigger didn't work
          console.log('🔍 Fetching user data from database...');
            console.log('✅ User data found in database');
          const { error: insertError } = await supabase
            .from('users')
            console.log('⚠️ User not found, creating manually...');
            .insert([{ id: data.user.id, email: data.user.email! }]);
          
          console.log('📊 Database fetch result:');
          console.log('- UserData:', userData);
          console.log('- FetchError:', fetchError);
            console.log('📊 Manual insert result:');
            console.log('- InsertError:', insertError);
            
          
              console.log('✅ User created manually');
          if (!insertError) {
            setUser({ id: data.user.id, email: data.user.email! });
          }
        }
      }, 1000);
    } else if (error) {
      console.error('❌ Signup failed with error:', error);
      console.error('- Error code:', error.code);
      console.error('- Error message:', error.message);
      console.error('- Error details:', error.details);
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