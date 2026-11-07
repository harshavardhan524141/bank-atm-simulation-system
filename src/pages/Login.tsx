import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../components/Toast.tsx';

interface LoginProps {
  onNavigate: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, quickLoginDemo } = useAuth();
  const { success, error: toastError } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier || !password) {
      setErrorMessage('Please enter your username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(identifier, password);
      success('Authentication Successful', `Welcome back, ${res.user.fullName}!`);
      if (res.role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify credentials.';
      setErrorMessage(msg);
      toastError('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = async (role: 'customer' | 'admin') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await quickLoginDemo(role);
      success('Demo Session Started', `Signed in as Demo ${role.toUpperCase()}`);
      onNavigate(role === 'admin' ? 'admin-dashboard' : 'dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start demo session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#F5F7FB]">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#102A43] text-white p-6 sm:p-8 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-blue-300" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Apex Digital Banking</h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in to access your ATM account or Administrator portal
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Instant Demo Profiles (1-Click Fill)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('customer')}
              className="p-2 bg-white rounded-xl border border-blue-200 text-left hover:border-blue-500 hover:shadow-xs transition-all"
            >
              <span className="text-[11px] font-bold text-slate-800 block">Customer Account</span>
              <span className="text-[10px] text-slate-500 font-mono block">john_doe (₹45.5k)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="p-2 bg-white rounded-xl border border-blue-200 text-left hover:border-blue-500 hover:shadow-xs transition-all"
            >
              <span className="text-[11px] font-bold text-slate-800 block">Administrator</span>
              <span className="text-[10px] text-slate-500 font-mono block">admin (Vance)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Identifier Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username or Registered Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="john_doe or admin@apexbank.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Account Password</label>
              <button
                type="button"
                onClick={() =>
                  alert('For password resets, please contact your local Apex Bank branch administrator or use the demo accounts.')
                }
                className="text-[11px] text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs text-slate-600">
              Remember credentials on this browser
            </label>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            New customer?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-blue-600 font-bold hover:underline"
            >
              Open a New Account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
