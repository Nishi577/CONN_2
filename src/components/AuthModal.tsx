import React, { useState } from 'react';
import { UserAccount } from '../types';
import {
  saveUserAccount,
  loadUserAccountByEmail,
  createBlankProfileForUser,
  saveProfileForUser,
} from '../lib/storage';
import { supabase, isSupabaseConfigured, upsertProfileToSupabase } from '../lib/supabase';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup' | 'forgot';
  onClose: () => void;
  onSuccessLogin: (user: UserAccount) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

// Simple reversible encoding for offline demo password storage.
const encodePassword = (pw: string): string => btoa(unescape(encodeURIComponent(pw)));
const checkPassword = (raw: string, stored: string): boolean => encodePassword(raw) === stored;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccessLogin,
  onShowToast,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      // Clear form state every time the modal is opened.
      setEmail('');
      setPassword('');
      setName('');
      setUsername('');
      setError('');
    }
  }, [isOpen, initialMode]);

  React.useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    // --- Forgot password ---
    if (mode === 'forgot') {
      if (!trimmedEmail) {
        setError('Please enter your email address.');
        setIsLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
        setIsLoading(false);
        if (resetError) {
          setError(resetError.message);
        } else {
          onShowToast(`Password reset link sent to ${trimmedEmail}`, 'info');
          setMode('login');
        }
      } else {
        setIsLoading(false);
        onShowToast(`If ${trimmedEmail} is registered, a reset link has been sent.`, 'info');
        setMode('login');
      }
      return;
    }

    // --- Sign Up ---
    if (mode === 'signup') {
      const trimmedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, '');
      const trimmedName = name.trim();

      if (!trimmedName || !trimmedUsername || !trimmedEmail || !password) {
        setError('All fields are required.');
        setIsLoading(false);
        return;
      }
      if (trimmedUsername.length < 3) {
        setError('Username must be at least 3 characters.');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setIsLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
          options: {
            data: {
              name: trimmedName,
              username: trimmedUsername,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsLoading(false);
          return;
        }

        if (!data.user) {
          setError('Could not complete signup. Please verify details and try again.');
          setIsLoading(false);
          return;
        }

        const newUser: UserAccount = {
          id: data.user.id,
          email: data.user.email || trimmedEmail,
          name: trimmedName,
          username: trimmedUsername,
          createdAt: data.user.created_at ? data.user.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        };

        // Initialize blank profile for user in Supabase
        const blank = createBlankProfileForUser(newUser);
        blank.id = data.user.id;
        const { error: profileErr } = await upsertProfileToSupabase(blank, data.user.id);
        if (profileErr) {
          console.warn('Initial profile upsert warning:', profileErr);
        }

        saveUserAccount(newUser);
        saveProfileForUser(blank);

        setIsLoading(false);
        onSuccessLogin(newUser);
        onShowToast('Account created! Welcome to Conn.', 'success');
        onClose();
        return;
      } else {
        // Offline / local fallback
        const existing = loadUserAccountByEmail(trimmedEmail);
        if (existing) {
          setError('An account with this email already exists. Please sign in.');
          setIsLoading(false);
          return;
        }

        const newUser: UserAccount = {
          id: `usr-${Date.now()}`,
          email: trimmedEmail,
          name: trimmedName,
          username: trimmedUsername,
          createdAt: new Date().toISOString().split('T')[0],
        };

        saveUserAccount(newUser);
        localStorage.setItem(`conn_user_pw_${trimmedUsername}`, encodePassword(password));
        const blank = createBlankProfileForUser(newUser);
        saveProfileForUser(blank);

        setIsLoading(false);
        onSuccessLogin(newUser);
        onShowToast('Account created! Welcome to Conn.', 'success');
        onClose();
        return;
      }
    }

    // --- Sign In ---
    if (isSupabaseConfigured) {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError('Sign in failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      const user = data.user;
      const metadata = user.user_metadata || {};
      const fallbackName = metadata.name || user.email?.split('@')[0] || 'User';
      const fallbackUsername = (metadata.username || user.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_\-]/g, '');

      const account: UserAccount = {
        id: user.id,
        email: user.email || trimmedEmail,
        name: fallbackName,
        username: fallbackUsername,
        createdAt: user.created_at ? user.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      };

      saveUserAccount(account);
      setIsLoading(false);
      onSuccessLogin(account);
      onShowToast('Welcome back!', 'success');
      onClose();
      return;
    } else {
      // Offline / local fallback
      const account = loadUserAccountByEmail(trimmedEmail);

      if (!account) {
        setError('No account found with that email address.');
        setIsLoading(false);
        return;
      }

      const storedPw = localStorage.getItem(`conn_user_pw_${account.username}`);
      if (!storedPw || !checkPassword(password, storedPw)) {
        setError('Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onSuccessLogin(account);
      onShowToast('Welcome back!', 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans-ui animate-in fade-in">
      <div
        className="w-full max-w-md bg-[#FAF8F5] text-[#1C1B18] rounded-2xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6B665E] hover:text-[#1C1B18] rounded-full transition-colors"
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
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all ${
              mode === 'login'
                ? 'border-[#1C1B18] text-[#1C1B18]'
                : 'border-transparent text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all ${
              mode === 'signup'
                ? 'border-[#1C1B18] text-[#1C1B18]'
                : 'border-transparent text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#6B665E] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B665E] uppercase mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="yourhandle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, ''))}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18] outline-none"
                />
                <p className="mt-1 text-2xs text-[#6B665E]">
                  Only lowercase letters, numbers, - and _ are allowed.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#6B665E] uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18] outline-none"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#6B665E] uppercase">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-xs text-[#6B665E] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18] outline-none"
              />
              {mode === 'signup' && (
                <p className="mt-1 text-2xs text-[#6B665E]">Minimum 6 characters.</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-xs mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading
              ? 'Please wait…'
              : mode === 'login'
              ? 'Sign In to Workspace'
              : mode === 'signup'
              ? 'Create My Conn Profile'
              : 'Send Reset Link'}
          </button>
        </form>

        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className="mt-4 w-full text-center text-xs text-[#6B665E] hover:text-[#1C1B18] transition-colors"
          >
            ← Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};
