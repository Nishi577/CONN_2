import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { MOCK_USER } from '../data/mockData';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, Sparkles, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup' | 'forgot';
  onClose: () => void;
  onSuccessLogin: (user: UserAccount) => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccessLogin,
  onShowToast,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('elena@rosto.va');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('Elena Rostova');
  const [username, setUsername] = useState('elenarostova');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      onShowToast(`Password reset link sent to ${email}`);
      setMode('login');
      return;
    }

    // Success login or signup
    const user: UserAccount = {
      id: `usr-${Date.now()}`,
      email,
      name: name || 'Elena Rostova',
      username: username || 'elenarostova',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSuccessLogin(user);
    onShowToast(mode === 'login' ? 'Welcome back!' : 'Account created successfully!');
    onClose();
  };

  const handleQuickDemoLogin = () => {
    onSuccessLogin(MOCK_USER);
    onShowToast('Logged in as Elena Rostova (Demo Creator)');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans-ui animate-in fade-in"
    >
      <div
        className="w-full max-w-md bg-[#FAF8F5] text-[#1C1B18] rounded-2xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6B665E] hover:text-[#1C1B18] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand mark */}
        <div className="mb-6 text-center">
          <span className="font-serif-display text-4xl text-[#1C1B18]">Conn.</span>
          <p className="text-xs text-[#6B665E] mt-1">Your personal space on the internet.</p>
        </div>

        {/* Mode Toggles */}
        <div className="flex border-b border-[#E8E4D9] mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all ${
              mode === 'login'
                ? 'border-[#1C1B18] text-[#1C1B18]'
                : 'border-transparent text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all ${
              mode === 'signup'
                ? 'border-[#1C1B18] text-[#1C1B18]'
                : 'border-transparent text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Button */}
        <button
          onClick={handleQuickDemoLogin}
          className="w-full mb-5 py-2.5 px-4 bg-[#E8E4D9]/60 hover:bg-[#E8E4D9] border border-[#E8E4D9] rounded-xl text-xs font-medium text-[#1C1B18] flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Quick 1-Click Guest Login (@elenarostova)</span>
        </button>

        <div className="relative text-center my-4">
          <span className="bg-[#FAF8F5] px-3 text-[11px] font-mono-code text-[#6B665E] relative z-10">
            or continue with email
          </span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8E4D9]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-[#6B665E] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B665E] uppercase mb-1">
                  Desired Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono-code text-[#6B665E]">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="elenarostova"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-7 pr-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#6B665E] uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="elena@rosto.va"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-[#6B665E] uppercase">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#6B665E] hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B665E] hover:text-[#1C1B18] transition-colors p-0.5 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-xs mt-2"
          >
            {mode === 'login'
              ? 'Sign In to Workspace'
              : mode === 'signup'
              ? 'Create My Conn Profile'
              : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};
