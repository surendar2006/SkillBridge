import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Target,
  FileCheck2,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-blue-300 bg-clip-text text-transparent">
              SkillBridge
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-12" />
          <div className="w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-3xl translate-x-36 translate-y-24" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/60 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-sm shadow-inner">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Empowering Modern Higher Education with AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Micro-Credential Curriculums Driven by{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Real-Time Global Job Demands
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Bridge the gap between static academic degrees and rapidly evolving enterprise requirements. Upload your resume, uncover critical skill deficits against permitted global job data, and generate tailored, competency-based micro-credential learning paths.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={currentUser ? "/dashboard" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all"
            >
              Analyze Your Resume Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/trends"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all"
            >
              Explore Skill Trends
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm text-left">
            <div className="p-3">
              <p className="text-2xl font-bold font-mono text-white">100%</p>
              <p className="text-xs text-slate-400 mt-1">Data-Driven Skill Mapping</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-bold font-mono text-indigo-400">Gemini 3.8</p>
              <p className="text-xs text-slate-400 mt-1">Structured NLP Reasoning</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-bold font-mono text-purple-400">Zero-Slop</p>
              <p className="text-xs text-slate-400 mt-1">Transparent Match Scores</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-bold font-mono text-emerald-400">NPTEL & edX</p>
              <p className="text-xs text-slate-400 mt-1">Verified Learning Links</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              A Complete Pipeline from Resume to Employability
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Designed specifically for engineering colleges and university students preparing for modern tech recruitment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-5">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">PDF & DOCX Resume Extraction</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Extract readable text, normalize synonym skills (e.g., Python3 → Python, K8s → Kubernetes), and allow manual student verification to guarantee 100% accuracy.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Safe server-side parser
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-5">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">Real Dataset Skill Trends</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Aggregates skill frequencies strictly from permitted, curated job postings. No fabricated statistics—honest frequency rankings across target roles.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-blue-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Admin dataset auditing
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-5">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">Personalized Micro-Credentials</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Generate modular, university-grade micro-credential curriculums with prerequisite sequences, hands-on portfolio labs, and capstone project specifications.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-purple-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Progress milestones & certificate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">SkillBridge Platform</span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400">College Mini-Project Edition</span>
          </div>
          <p className="text-xs text-slate-400">
            Powered by Firebase Firestore, Firebase Authentication, and Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};
