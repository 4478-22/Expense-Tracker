import React, { useState } from 'react';
import { LogIn, UserPlus, DollarSign } from 'lucide-react';

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
}

export function AuthForm({ onSignIn, onSignUp }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 AuthForm Debug - Form submission started');
    console.log('📧 Email input:', email);
    console.log('🔒 Password input length:', password.length);
    console.log('🔄 Is signup mode:', isSignUp);
    
    setLoading(true);
    setError(null);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    console.log('✨ Trimmed email:', trimmedEmail);
    console.log('✅ Email regex test:', emailRegex.test(trimmedEmail));
    
    if (!emailRegex.test(trimmedEmail)) {
      console.error('❌ Email validation failed');
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      console.error('❌ Password too short');
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    console.log('🚀 Calling authentication function...');
    const { error } = isSignUp 
      ? await onSignUp(email, password)
      : await onSignIn(email, password);

    console.log('📊 Authentication result:');
    console.log('- Error:', error);
    
    if (error) {
      console.error('❌ Authentication failed:', error);
      // Provide more user-friendly error messages
      if (error.message.includes('email_address_invalid')) {
        console.error('❌ Email address invalid error');
        setError('Please enter a valid email address');
      } else if (error.message.includes('weak_password')) {
        console.error('❌ Weak password error');
        setError('Password is too weak. Please use at least 6 characters');
      } else if (error.message.includes('user_already_exists')) {
        console.error('❌ User already exists error');
        setError('An account with this email already exists. Please sign in instead.');
      } else if (error.message.includes('Invalid login credentials')) {
        console.error('❌ Invalid credentials error');
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        console.error('❌ Other error:', error.message);
        setError(error.message);
      }
    } else {
      console.log('✅ Authentication successful!');
      // Clear form on successful authentication
      if (isSignUp) {
        console.log('🧹 Clearing signup form');
        setEmail('');
        setPassword('');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              'Loading...'
            ) : isSignUp ? (
              <>
                <UserPlus className="h-5 w-5" />
                Sign Up
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}