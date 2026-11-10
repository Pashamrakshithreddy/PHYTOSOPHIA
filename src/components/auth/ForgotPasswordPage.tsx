import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sprout, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setIsLoading(true);
    await sendPasswordReset(email);
    setIsLoading(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#ebf1ed] relative overflow-hidden">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white p-8 rounded-3xl shadow-2xl space-y-5 relative z-10">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-lime-500/30">
            <Sprout className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email to receive a secure recovery link.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-xs font-bold">Reset Link Dispatched!</h4>
            <p className="text-[11px] text-slate-600">
              We sent password reset instructions to <strong>{email}</strong>. Check your inbox!
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-2 text-xs text-emerald-700 font-extrabold hover:underline block mx-auto"
            >
              Return to Login
            </button>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all"
            >
              {isLoading ? 'Sending Link...' : 'SEND RESET LINK'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('login')}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
