'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          alt="Co-working space"
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 md:p-12 w-full">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <span className="text-2xl font-black tracking-tighter text-white font-headline">TitikTemu</span>
          </div>

          <div className="glass rounded-4xl p-10 md:p-12 border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Sign In</h1>
              <p className="text-on-surface-variant text-sm font-medium">Access your workspace portfolio and bookings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-5 py-4 bg-surface-container-low rounded-xl border-none focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline/50 text-sm font-medium"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                  <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot Password?</Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-5 py-4 bg-surface-container-low rounded-xl border-none focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline/50 text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all tracking-wide disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-on-surface-variant">
                New to TitikTemu?{' '}
                <Link href="/auth/register" className="text-primary font-bold ml-1 hover:underline underline-offset-4">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <div className="h-px w-8 bg-white/20 self-center" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40">Secured by TitikTemu Systems</span>
            <div className="h-px w-8 bg-white/20 self-center" />
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 w-full flex flex-col md:flex-row justify-between items-center px-8 py-6 z-20">
        <div className="text-[11px] font-medium tracking-wide text-white/50">© 2024 TitikTemu</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="#" className="text-[11px] font-medium tracking-wide uppercase text-white/40 hover:text-white">Privacy Policy</Link>
          <Link href="#" className="text-[11px] font-medium tracking-wide uppercase text-white/40 hover:text-white">Terms of Service</Link>
        </div>
      </footer>
    </main>
  );
}
