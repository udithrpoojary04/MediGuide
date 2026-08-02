import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Shield, Heart, MapPin, Activity, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Decorative background gradients */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2.5 rounded-2xl shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 tracking-tight">
                MediGuide AI
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-sm font-bold text-slate-700 hover:text-primary-600 px-4 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-105 hover:shadow-primary-500/50"
            >
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero section */}
        <div className="relative pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-sm mb-8">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI-Powered Healthcare Navigation</span>
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-7xl leading-tight">
                Understand your symptoms. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-sky-600">
                  Find the right care.
                </span>
              </h1>
              <p className="mt-6 text-xl leading-relaxed text-slate-600 font-medium max-w-2xl mx-auto">
                AI-assisted preliminary symptom screening, intelligent urgency classification, and interactive nearby healthcare discovery—all in one privacy-first platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary-500/30 transition-all hover:scale-105 hover:shadow-primary-500/50"
                >
                  Start Symptom Check <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  to="/healthcare" 
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-white hover:scale-105"
                >
                  <MapPin className="mr-2 w-5 h-5 text-primary-500" /> Find Nearby Hospitals
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div className="py-20 bg-white/60 backdrop-blur-md border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary-600">Complete Health Companion</h2>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Built for Clarity, Speed, and Privacy
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="glass-card rounded-3xl p-8 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
                    <Activity className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">AI Symptom Analysis</h3>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    Multi-turn conversational symptom intake with automated emergency red-flag detection and structured urgency ratings.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="glass-card rounded-3xl p-8 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">Healthcare Finder</h3>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    Interactive OpenStreetMap locator finding verified hospitals, emergency centers, and pharmacies within customizable radii.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="glass-card rounded-3xl p-8 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6">
                    <ShieldCheck className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">100% Free & Private</h3>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    Built entirely on open-source and free APIs with secure JWT authentication and permanent one-click data deletion control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer section */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="glass-card rounded-3xl p-8 border border-amber-200 bg-amber-50/40 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-900">Medical Disclaimer</h3>
                  <p className="mt-1 text-sm font-medium text-amber-800/90 leading-relaxed">
                    MediGuide AI provides informational guidance only and does NOT constitute professional medical diagnosis or prescription. Always consult a qualified physician for healthcare decisions. In case of life-threatening symptoms, immediately contact local emergency services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-xl text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white">MediGuide AI</span>
          </div>
          <p className="text-xs font-medium">
            &copy; {new Date().getFullYear()} MediGuide AI. Full-Stack MERN Project.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
