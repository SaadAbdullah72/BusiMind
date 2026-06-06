import React, { useState, useEffect } from 'react';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

type AuthView = 'login' | 'forgot-password' | 'otp-verify';

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // Forgot Password / OTP States
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [simulatedNotification, setSimulatedNotification] = useState<string | null>(null);

  // Initialize Google Login dynamically using Client ID from backend config
  useEffect(() => {
    const initGoogleOAuth = async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        
        if (data.google_client_id && (window as any).google) {
          (window as any).google.accounts.id.initialize({
            client_id: data.google_client_id,
            callback: handleGoogleCredentialResponse,
            context: 'signin',
            ux_mode: 'popup',
            auto_select: false,
          });

          // Render button programmatically
          const btnParent = document.getElementById("google-signin-btn");
          if (btnParent) {
            (window as any).google.accounts.id.renderButton(btnParent, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              width: 380,
              logo_alignment: 'center'
            });
          }
        }
      } catch (err) {
        console.error("Google authentication service failed to initialize:", err);
      }
    };

    // Brief timeout to ensure the Google GSI CDN script has parsed in DOM
    const delayTimer = setTimeout(initGoogleOAuth, 800);
    return () => clearTimeout(delayTimer);
  }, [view]);

  // Handle Google OAuth successful callback response
  const handleGoogleCredentialResponse = async (response: any) => {
    setError('');
    setIsLoading(true);
    setLoadingStep('Verifying Google authorization token...');
    
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      });
      const data = await res.json();
      
      if (res.ok && data.status === 'success') {
        triggerLoadingSequence(data.email);
      } else {
        setError(data.message || 'Google authorization rejected.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to reach authentication gateway.');
      setIsLoading(false);
    }
  };

  // Credentials form submission (verified on backend)
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Sending secure credentials...');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        triggerLoadingSequence(data.email);
      } else {
        setError(data.message || 'Invalid email or password.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Server connection failed.');
      setIsLoading(false);
    }
  };

  // Forgot password form submission
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!resetEmail) {
      setError('Please enter your email.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Checking email eligibility...');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setIsLoading(false);
        setView('otp-verify');
        setInfoMessage('Enter the 6-digit OTP code sent to your email.');
      } else {
        setError(data.message || 'Email not found.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to request OTP code.');
      setIsLoading(false);
    }
  };

  // OTP Verification and Password Reset
  const handleOTPVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || !newPassword) {
      setError('All fields are required.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Verifying OTP code...');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          otp: otpCode,
          new_password: newPassword
        })
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setIsLoading(false);
        setView('login');
        setInfoMessage('Password reset successfully! Log in with your new credentials.');
        setSimulatedNotification(null);
      } else {
        setError(data.message || 'OTP verification failed.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to verify OTP code.');
      setIsLoading(false);
    }
  };

  const triggerLoadingSequence = (userEmail: string) => {
    setLoadingStep('Establishing secure network tunnel...');
    setTimeout(() => {
      setLoadingStep('Authenticating encrypted tokens...');
      setTimeout(() => {
        setLoadingStep('Syncing neural analytics layers...');
        setTimeout(() => {
          onLoginSuccess(userEmail);
        }, 800);
      }, 700);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-sans antialiased relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[#030303]/90 backdrop-blur-[2px] z-0"></div>{/* Simulated Email / OTP Notification Banner */}
      {simulatedNotification && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slideDown">
          <div className="bg-[#0e0e11] border border-orange-500/30 rounded-2xl p-4 shadow-[0_4px_30px_rgba(249,115,22,0.15)] backdrop-blur-md flex items-start space-x-3.5">
            <div className="text-2xl mt-0.5 animate-bounce">🔑</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Secure Access Notification</h4>
              <p className="text-xs text-slate-300 mt-1 font-mono break-words">{simulatedNotification}</p>
            </div>
            <button 
              onClick={() => setSimulatedNotification(null)}
              className="text-slate-500 hover:text-slate-300 transition-colors text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full relative z-10">
        
        {/* Left Visual Area - Cyborg Visual */}
        <div className="lg:col-span-7 relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-[#1a1a1a]/40">
          
          {/* Top text overlay */}
          <div className="relative z-20 max-w-lg mt-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight uppercase font-sans">
              Into Successful<br />
              <span className="text-slate-100">
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
        <div className="lg:col-span-5 flex flex-col justify-center px-6 py-8 md:py-12 md:px-16 lg:px-20 bg-[#070708] relative">
          
          <div className="max-w-md w-full mx-auto space-y-6 md:space-y-8">
                  {/* Rotating Logo */}
            <div className="flex flex-col items-center">
                      <defs>
                        <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                        <linearGradient id="amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* Back floating layer (gives hologram depth) */}
                  <div className="logo-face" style={{ transform: 'translateZ(-20px) rotateY(180deg)' }}>
                    <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                      <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="rgba(249,115,22,0.4)" strokeWidth="3"/>
                      <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="1.5"/>
                      <path d="M50 20 L50 50 M25 35 L50 50 M75 35 L50 50 M25 65 L50 50 M75 65 L50 50 M50 80 L50 50" stroke="rgba(251,191,36,0.3)" strokeWidth="1.5" strokeDasharray="3 3"/>
                      <circle cx="50" cy="50" r="5" fill="rgba(255,255,255,0.4)"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {view === 'login' && (
              <>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">Get Started</h1>
                </div>

                <form onSubmit={handleCredentialsLogin} className="space-y-6">
                  
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold flex items-center space-x-2 animate-shake">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {infoMessage && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold flex items-center space-x-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{infoMessage}</span>
                    </div>
                  )}

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Your Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#0a0a0c] border border-[#1e1e24] hover:border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
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

                  {/* Remember and Forgot password */}
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="accent-orange-500 rounded bg-[#0a0a0c] border-[#1e1e24]"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot-password'); setError(''); setInfoMessage(''); }}
                      className="text-orange-500 hover:text-orange-400 font-medium cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)] transition-all text-sm relative overflow-hidden active:scale-[0.99] disabled:opacity-50 cursor-pointer"
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

                  {/* Real Google Button Container */}
                  <div className="flex justify-center w-full">
                    <div id="google-signin-btn" className="min-h-[44px]"></div>
                  </div>

                </form>
              </>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === 'forgot-password' && (
              <>
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">Forgot Password</h1>
                  <p className="text-slate-400 text-sm mt-2 font-medium">
                    Enter your email to receive an authorization code.
                  </p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold flex items-center space-x-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Your Email</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#0a0a0c] border border-[#1e1e24] hover:border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] transition-all text-sm relative overflow-hidden active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Requesting OTP...' : 'Send OTP Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(''); }}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </form>
              </>
            )}

            {/* OTP VERIFY VIEW */}
            {view === 'otp-verify' && (
              <>
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">Verify Security Code</h1>
                  <p className="text-slate-400 text-sm mt-2 font-medium">
                    Provide the 6-digit OTP code and choose your new password.
                  </p>
                </div>

                <form onSubmit={handleOTPVerifySubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold flex items-center space-x-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {infoMessage && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-400 font-semibold flex items-center space-x-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{infoMessage}</span>
                    </div>
                  )}

                  {/* OTP Code Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">OTP Security Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 489254"
                      className="w-full bg-[#0a0a0c] border border-[#1e1e24] hover:border-slate-700 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-center tracking-widest font-mono text-lg transition-all"
                    />
                  </div>

                  {/* New Password Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0a0a0c] border border-[#1e1e24] hover:border-slate-700 focus:border-orange-500 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showNewPassword ? (
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] transition-all text-sm relative overflow-hidden active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Verifying OTP & Resetting...' : 'Verify OTP & Reset Password'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(''); setInfoMessage(''); }}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </form>
              </>
            )}

          </div>

        </div>

      </div>

      {/* Database Connecting Loader Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-opacity duration-300 animate-fadeIn">
          <div className="space-y-6 text-center max-w-sm px-6">
            
            {/* Spinning glowing portal */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-slate-500 border-r-slate-400 rounded-full animate-spin"></div>
              <div className="absolute inset-3 border border-slate-500/30 border-dashed rounded-full animate-reverse-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    </div>
  );
}
