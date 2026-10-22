import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Sparkles,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Chrome,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loginWithEmail,
    loginWithGoogle,
    loginWithGoogleRedirect,
    loginAnonymously,
    authError,
    clearAuthError,
    currentUser
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [copied, setCopied] = useState(false);

  // If already logged in, redirect
  if (currentUser) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  }

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
    if (!email || !password) {
      setLocalError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      await loginWithEmail(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.warn('[Login Error Code]', err?.code);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setLocalError('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setLocalError('Access temporarily disabled due to multiple failed attempts. Try again later or reset password.');
      } else {
        setLocalError(err.message || 'Failed to sign in. Please check your network connection.');
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
      console.warn('[Google Popup Error Code]', err?.code);
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
      console.warn('[Google Redirect Error Code]', err?.code);
      setShowDiagnostics(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLocalError(null);
    clearAuthError();
    try {
      setDemoLoading(true);
      await loginAnonymously();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.warn('[Demo Login Error Code]', err?.code);
      setShowDiagnostics(true);
    } finally {
      setDemoLoading(false);
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Or{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            create a new student account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl">
          {/* General or local error */}
          {localError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {/* Diagnostic Auth Error Banner */}
          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-200 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    {authError.code ? `Auth Notice (${authError.code})` : 'Authentication Notice'}
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

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Email address
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In with Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign-in section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-400 font-semibold tracking-wider">
                  Or continue with Google
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {/* Primary Google Login via Popup */}
              <button
                type="button"
                onClick={handleGooglePopup}
                disabled={loading || demoLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-sm font-medium text-slate-200 transition-colors disabled:opacity-60"
              >
                <Chrome className="w-4 h-4 text-rose-400" />
                Sign in with Google (Popup)
              </button>

              {/* Alternative Google Login via Redirect */}
              <button
                type="button"
                onClick={handleGoogleRedirect}
                disabled={loading || demoLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-950/50 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-60"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                Having popup issues? Try Google Redirect Sign-In
              </button>
            </div>
          </div>

          {/* Instant Evaluation: Continue as Demo User Button */}
          <div className="mt-6 pt-5 border-t border-slate-800/90">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800/50">
                Instant Evaluation
              </span>
              <p className="text-xs text-slate-400 mt-1.5">
                Explore the platform without creating an account.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold bg-slate-800/90 hover:bg-slate-750 text-indigo-300 hover:text-white border border-indigo-700/50 hover:border-indigo-500 shadow-md shadow-indigo-950/40 transition-all disabled:opacity-60 group"
            >
              {demoLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Entering Demo Environment...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Continue as Demo User</span>
                </>
              )}
            </button>
          </div>

          {/* Collapsible Diagnostics & Setup Guide */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowDiagnostics(prev => !prev)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Firebase Auth & Domain Setup Details
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
                  <p className="text-slate-400 font-semibold">1. Current Hostname:</p>
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
                  <p className="text-slate-400 font-semibold">2. Firebase Project & Auth Domain:</p>
                  <p className="font-mono text-slate-300 mt-0.5">Project ID: {firebaseConfig.projectId}</p>
                  <p className="font-mono text-slate-300">Auth Domain: {firebaseConfig.authDomain}</p>
                </div>

                <div>
                  <p className="text-slate-400 font-semibold">3. Required Firebase Console Setup:</p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-400 mt-1">
                    <li>
                      <strong>Anonymous Provider</strong>: Go to <em className="text-slate-300">Authentication → Sign-in method</em>, click <strong>Anonymous</strong>, toggle <strong>Enable</strong>, and save.
                    </li>
                    <li>
                      <strong>Google Provider</strong>: Go to <em className="text-slate-300">Authentication → Sign-in method</em> and verify Google is enabled.
                    </li>
                    <li>
                      <strong>Authorized Domains</strong>: Go to <em className="text-slate-300">Authentication → Settings → Authorized domains</em> and ensure <code className="text-indigo-300 font-mono">{currentHostname}</code> and <code className="text-indigo-300 font-mono">localhost</code> are listed.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
