import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Chrome,
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    registerWithEmail,
    loginWithGoogle,
    loginWithGoogleRedirect,
    authError,
    clearAuthError
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const handleCopyHost = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(email, password, name);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.warn('[Register Error Code]', err?.code);
      if (err.code === 'auth/email-already-in-use') {
        setLocalError('This email address is already registered. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setLocalError('Password is too weak. Please choose a stronger password.');
      } else {
        setLocalError(err.message || 'Failed to register account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePopup = async () => {
    setLocalError(null);
    clearAuthError();
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.warn('[Register Google Popup Error Code]', err?.code);
      setShowDiagnostics(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setLocalError(null);
    clearAuthError();
    try {
      setLoading(true);
      await loginWithGoogleRedirect();
    } catch (err: any) {
      console.warn('[Register Google Redirect Error Code]', err?.code);
      setShowDiagnostics(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-blue-300 bg-clip-text text-transparent">
            SkillBridge
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Create your student account
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl">
          {localError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-200 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    {authError.code ? `Auth Error (${authError.code})` : 'Google Registration Notice'}
                  </p>
                  <p className="text-amber-300/90 mt-0.5">{authError.message}</p>
                </div>
              </div>

              {authError.suggestedFix && (
                <div className="p-2.5 rounded-lg bg-black/40 border border-amber-800/40 text-[11px] leading-relaxed text-amber-200">
                  <strong className="text-amber-400 block mb-0.5 font-semibold">Suggested Action:</strong>
                  {authError.suggestedFix}
                </div>
              )}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Surendar R"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                College / Personal Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-400 font-semibold tracking-wider">
                  Or register with Google
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={handleGooglePopup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-sm font-medium text-slate-200 transition-colors"
              >
                <Chrome className="w-4 h-4 text-rose-400" />
                Register with Google (Popup)
              </button>

              <button
                type="button"
                onClick={handleGoogleRedirect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-950/50 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                Having popup issues? Try Google Redirect Registration
              </button>
            </div>
          </div>

          {/* Setup Guide */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowDiagnostics(prev => !prev)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Firebase Setup & Domain Diagnostics
              </span>
              {showDiagnostics ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {showDiagnostics && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-3">
                <div>
                  <p className="text-slate-400 font-semibold">Current Hostname:</p>
                  <div className="flex items-center justify-between gap-2 mt-1 p-1.5 px-2 bg-slate-900 rounded-lg border border-slate-800 font-mono text-slate-200">
                    <span className="truncate">{currentHostname}</span>
                    <button
                      type="button"
                      onClick={handleCopyHost}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Copy hostname"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 font-semibold">Firebase Project:</p>
                  <p className="font-mono text-slate-300 mt-0.5">Project ID: {firebaseConfig.projectId}</p>
                  <p className="font-mono text-slate-300">Auth Domain: {firebaseConfig.authDomain}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
