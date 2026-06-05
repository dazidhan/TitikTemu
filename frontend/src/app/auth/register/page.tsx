'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen overflow-hidden">
      {/* Left: Visual */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-on-surface">
        <Image
          src="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1200&q=80"
          alt="Luxury architectural workspace"
          fill
          className="object-cover opacity-80 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <Link href="/" className="text-white text-2xl font-headline font-extrabold tracking-tighter">
            TitikTemu
          </Link>
          <div className="space-y-6">
            <h2 className="text-5xl font-headline font-bold text-white leading-tight tracking-tight max-w-lg">
              TitikTemu for Modern Professionals
            </h2>
            <p className="text-white/70 text-lg font-light leading-relaxed max-w-md">
              Experience a new standard of workspace management where precision meets luxury
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="h-[1px] w-12 bg-white/30" />
              <span className="text-white/50 text-xs font-headline tracking-[0.2em] uppercase">Join the 1%</span>
            </div>
          </div>
          <div className="text-white/40 text-xs font-inter tracking-wide">
            © 2024 TitikTemu. All rights reserved
          </div>
        </div>
      </section>

      {/* Right: Form */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-surface px-8 md:px-24 py-12 relative min-h-screen">
        <div className="w-full max-w-md space-y-10">
          <div className="lg:hidden text-center">
            <Link href="/" className="text-on-surface text-2xl font-headline font-extrabold tracking-tighter">TitikTemu</Link>
          </div>

          <header className="space-y-2">
            <h1 className="text-3xl font-headline font-bold tracking-tight text-on-surface">Create Account</h1>
            <p className="text-on-surface-variant font-medium text-sm">Join our network of architectural excellence</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Full Name</label>
              <input name="name" type="text" required value={form.name} onChange={handleChange}
                className="w-full bg-surface-container border-0 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                placeholder="Julian Henderson" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Business Email</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                className="w-full bg-surface-container border-0 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                placeholder="julian@company.com" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Phone (Optional)</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                className="w-full bg-surface-container border-0 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                placeholder="+1 (555) 234-8901" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Company (Optional)</label>
              <input name="company" type="text" value={form.company} onChange={handleChange}
                className="w-full bg-surface-container border-0 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                placeholder="Henderson Design Studio" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Password</label>
              <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange}
                className="w-full bg-surface-container border-0 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all"
                placeholder="••••••••" />
            </div>

            {error && (
              <div className="bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full primary-gradient text-on-primary font-headline font-semibold py-4 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <footer className="text-center">
            <p className="text-sm text-on-surface-variant font-medium">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-bold hover:underline underline-offset-4 ml-1">Log In</Link>
            </p>
          </footer>
        </div>

        {/* Floating trust badge */}
        <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-3 bg-surface-container-lowest p-4 rounded-2xl shadow-blue-md">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-outline tracking-widest uppercase leading-none mb-1">Trusted By</p>
            <p className="text-xs font-headline font-bold text-on-surface leading-none">Global Architecture Hub</p>
          </div>
        </div>
      </section>
    </main>
  );
}
