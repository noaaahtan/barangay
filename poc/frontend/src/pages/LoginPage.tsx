import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';

export function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-50/40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Green with Logo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-green-600 px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="bg-white rounded-full p-6 shadow-lg">
              <img
                src="/sta-ana-logo.png"
                alt="Barangay Sta Ana"
                className="h-40 w-40 object-contain"
              />
            </div>
          </div>

          {/* Government Branding */}
          <div className="text-center text-white space-y-4">
            <h1 className="text-3xl font-bold">Barangay Sta Ana</h1>
            <h2 className="text-xl font-semibold">Government Portal</h2>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-700/50 rounded-full">
                <div className="h-2 w-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm">System Online</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3 text-white">
              <div className="mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Apply for Requirements</p>
                <p className="text-sm text-green-100">Submit barangay requirements and monitor when ready for pickup.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-white">
              <div className="mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Reserve Equipment</p>
                <p className="text-sm text-green-100">Book barangay equipment like tables, chairs, and tents for your events.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-white">
              <div className="mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">E-Sumbong</p>
                <p className="text-sm text-green-100">Report emergencies, incidents, or issues like broken streetlights.</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 text-center text-sm text-green-100">
            <p>©2026 Barangay Sta Ana. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="bg-white rounded-full p-4 shadow-md">
              <img
                src="/sta-ana-logo.png"
                alt="Barangay Sta Ana"
                className="h-20 w-20 object-contain"
              />
            </div>
          </div>

          <h1 className="mb-1 text-2xl font-bold text-slate-900">
            Welcome back
          </h1>
          <p className="mb-8 text-sm text-slate-600">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-700 mb-3">Demo credentials</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@barangay.ph');
                  setPassword('barangay2026');
                }}
                className="w-full text-left rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50 hover:border-brand-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Admin</p>
                    <p className="text-xs text-slate-500">admin@barangay.ph</p>
                  </div>
                  <span className="text-xs text-brand-600 font-medium">Click to fill</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('citizen@barangay.ph');
                  setPassword('barangay2026');
                }}
                className="w-full text-left rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50 hover:border-brand-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Citizen</p>
                    <p className="text-xs text-slate-500">citizen@barangay.ph</p>
                  </div>
                  <span className="text-xs text-brand-600 font-medium">Click to fill</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
