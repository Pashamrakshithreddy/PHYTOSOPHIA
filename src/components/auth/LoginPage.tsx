import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sprout, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, rememberMe);
      onNavigate('dashboard');
    } catch {
      setErrorMessage('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await login('demo.gardener@phytosophia.ai', 'google-auth-pass', true);
    setIsLoading(false);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#ebf1ed] relative overflow-hidden">
      {/* Soft Background Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-lime-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white p-8 rounded-3xl shadow-2xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-lime-500/30">
            <Sprout className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">Continue caring for your digital garden.</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gardener@phytosophia.ai"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-lime-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-lime-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-lime-600 focus:ring-lime-500"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating Garden...</span>
            ) : (
              <>
                <span>LOGIN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Google SSO Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          CONTINUE WITH GOOGLE
        </button>

        {/* Sign Up Redirect */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have a garden yet?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-emerald-600 font-bold hover:underline"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
