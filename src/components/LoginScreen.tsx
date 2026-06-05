import React, { useState } from 'react';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (email.trim() === 'saad489254@gmail.com' && password === 'admin123') {
      triggerLoginSuccess('saad489254@gmail.com');
    } else {
      setError('Invalid email or password.');
    }
  };

  const triggerLoginSuccess = (userEmail: string) => {
    setIsLoading(true);
    setLoadingStep('Connecting to secure gateway...');
    
    setTimeout(() => {
      setLoadingStep('Authenticating credentials...');
      setTimeout(() => {
        setLoadingStep('Initializing AI model environments...');
        setTimeout(() => {
          onLoginSuccess(userEmail);
        }, 800);
      }, 700);
    }, 600);
  };

  const handleGoogleClick = () => {
    setShowGoogleModal(true);
  };

  const selectGoogleAccount = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setShowGoogleModal(false);
      setGoogleLoading(false);
      triggerLoginSuccess('saad489254@gmail.com');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-sans antialiased relative overflow-hidden select-none">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full relative z-10">
        
        {/* Left Visual Area - Cyborg Visual */}
        <div className="lg:col-span-7 relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-[#1a1a1a]/40">
          
          {/* Top text overlay */}
          <div className="relative z-20 max-w-lg mt-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight uppercase font-sans">
              Into Successful<br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Business.
              </span>
            </h2>
            <p className="text-slate-400 text-sm mt-3 tracking-wide max-w-sm">
              Supercharge your retail ecosystem using advanced neural analytics, real-time prediction scanning, and strategy sandboxing.
            </p>
          </div>

          {/* Cyborg image background absolute fit */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
            <img 
              src="/login_hero.png" 
              alt="Cyborg visual" 
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-[1.02]"
            />
            {/* Overlay gradient to blend bottom/right */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#050505]/10 to-[#050505] opacity-80"></div>
          </div>

          {/* Bottom Branding info */}
          <div className="relative z-20 flex items-center space-x-2 text-xs text-slate-500 mt-auto">
            <span>Powered by BusiMind AI</span>
            <span>•</span>
            <span>v2.4.0-neural</span>
          </div>
        </div>

        {/* Right Auth Panel */}
        <div className="lg:col-span-5 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-20 bg-[#070708] relative">
          
          <div className="max-w-md w-full mx-auto space-y-8">
            
            {/* Branding Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <div className="w-full h-full bg-[#0a0a0c] rounded-[10px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <span className="text-lg font-bold tracking-wider text-slate-200">RetailMind AI</span>
            </div>

            {/* Headers */}
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Get Started</h1>
              <p className="text-slate-400 text-sm mt-2 font-medium">
                Welcome to HextaStudio - Let's get started
              </p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-6">
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold flex items-center space-x-2 animate-shake">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Your Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#0a0a0c] border border-[#1e1e24] hover:border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="DsIs23@#12ds"
                    className="w-full bg-[#0a0a0c] border border-[#1e1e24] hover:border-slate-700 focus:border-orange-500 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Extra row */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="accent-orange-500 rounded bg-[#0a0a0c] border-[#1e1e24]"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="text-orange-500 hover:text-orange-400 font-medium">Forgot Password?</a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] transition-all text-sm relative overflow-hidden active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Sign in</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1e1e24]"></div>
                </div>
                <span className="relative px-3 bg-[#070708] text-xs text-slate-500 uppercase tracking-widest font-semibold">Or</span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 border border-[#1e1e24] bg-[#0a0a0c] hover:bg-[#121216] rounded-xl py-3 text-sm font-semibold text-slate-200 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.514 5.514 0 0 1 8.4 13c0-3.047 2.476-5.514 5.59-5.514c1.464 0 2.784.557 3.794 1.467l3.14-3.14C18.89 3.916 16.57 3 14 3C8.477 3 4 7.477 4 13s4.477 10 10 10c5.772 0 9.886-4.053 9.886-10c0-.682-.083-1.32-.224-1.715H12.24z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

            </form>

            {/* Helper Credentials Hint */}
            <div className="p-3 bg-[#0a0a0c] border border-[#1a1a20] rounded-xl text-center">
              <span className="text-[11px] text-slate-500 font-semibold">
                Hint: Log in with <span className="text-orange-400">saad489254@gmail.com</span> / <span className="text-orange-400">admin123</span>
              </span>
            </div>

            {/* Bottom Footer */}
            <div className="text-center text-xs text-slate-500">
              Already have an account? <span className="text-orange-500 hover:text-orange-400 cursor-pointer font-medium">Sign In</span>
            </div>

          </div>

        </div>

      </div>

      {/* Database Connecting Loader Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-opacity duration-300 animate-fadeIn">
          <div className="space-y-6 text-center max-w-sm px-6">
            
            {/* Spinning glowing portal */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-orange-500 border-r-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-3 border border-orange-500/30 border-dashed rounded-full animate-reverse-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a9 9 0 001.8 5.4L5 18.28" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Accessing Database</h3>
              <p className="text-xs text-slate-400 font-mono tracking-wider transition-all duration-300">
                {loadingStep}
              </p>
            </div>
            
            {/* Tiny logs window */}
            <div className="w-full bg-[#0a0a0c] border border-[#1e1e24] p-3 rounded-lg text-left font-mono text-[9px] text-slate-500 h-20 overflow-hidden leading-relaxed shadow-inner">
              <div>[SYSTEM] Initiating authentication handshake</div>
              <div>[SECURE] Connected to api.busimind.com/v2</div>
              <div>[AUTH] Handshake verification passed: OK</div>
              <div>[CLIENT] Session token generated successfully</div>
              <div className="animate-pulse text-orange-500/80">[ENV] Unlocking modules: overview, expiry, strategic_sandbox</div>
            </div>

          </div>
        </div>
      )}

      {/* Simulated Google Consent Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0d0d0f] border border-[#1e1e24] rounded-2xl p-6 shadow-2xl space-y-6 relative">
            
            {/* Modal Close */}
            <button
              onClick={() => !googleLoading && setShowGoogleModal(false)}
              disabled={googleLoading}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Google Logo and Title */}
            <div className="flex flex-col items-center space-y-2 text-center pt-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.11C3.18 21.88 7.39 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.62H1.21C.44 8.16 0 9.88 0 11.7c0 1.82.44 3.54 1.21 5.08l4.11-3.11z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.18 2.12 1.21 5.62l4.11 3.11c.94-2.85 3.57-4.98 6.68-4.98z"
                />
              </svg>
              <h2 className="text-base font-bold text-white">Sign in with Google</h2>
              <p className="text-xs text-slate-400">to continue to <span className="text-orange-500 font-semibold">BusiMind Engine</span></p>
            </div>

            {/* Account Selector */}
            {googleLoading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs text-slate-400 font-medium">Authorizing Google profile...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                <button
                  onClick={selectGoogleAccount}
                  className="w-full flex items-center space-x-3 p-3 bg-[#111113] hover:bg-[#161619] border border-[#1e1e24] hover:border-slate-700 rounded-xl transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-orange-400 transition-colors">Saad Abdullah</p>
                    <p className="text-[10px] text-slate-500 truncate">saad489254@gmail.com</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => alert("Please sign in with Saad's account for this demo.")}
                  className="w-full flex items-center space-x-3 p-3 bg-[#0a0a0c] hover:bg-[#111113] border border-[#141418] rounded-xl transition-all text-left group opacity-60 hover:opacity-100 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    G
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-300 truncate">Use another account</p>
                  </div>
                </button>
              </div>
            )}

            {/* Disclaimer */}
            <div className="text-[10px] text-slate-500 leading-relaxed text-center">
              To proceed, Google will share your name, email address, language preference, and profile picture with RetailMind AI.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
