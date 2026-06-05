'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled || !isHomepage
        ? 'bg-white/80 backdrop-blur-xl shadow-blue-sm'
        : 'bg-transparent'
    }`}>
      <div className="flex justify-between items-center w-full px-8 md:px-12 py-5 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tighter text-slate-900 font-headline">
          TitikTemu
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/spaces" className={`font-semibold transition-colors duration-300 ${
            pathname.startsWith('/spaces')
              ? 'text-primary border-b-2 border-primary pb-1'
              : 'text-slate-500 hover:text-primary'
          }`}>Find a Space</Link>
          <Link href="/spaces?type=Meeting+Room" className="text-slate-500 font-medium hover:text-primary transition-colors duration-300">Solutions</Link>
          <Link href="/spaces?type=Event+Space" className="text-slate-500 font-medium hover:text-primary transition-colors duration-300">Enterprise</Link>
          <Link href="/spaces" className="text-slate-500 font-medium hover:text-primary transition-colors duration-300">Pricing</Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex gap-4 items-center">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link href="/admin" className="text-slate-500 font-medium hover:text-slate-900 transition-all">
                  Admin
                  <span className="ml-1 text-primary material-symbols-outlined text-sm align-middle">admin_panel_settings</span>
                </Link>
              ) : (
                <Link href="/dashboard" className="text-slate-500 font-medium hover:text-slate-900 transition-all">
                  My Bookings
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-slate-500 font-medium hover:text-slate-900 transition-all opacity-80 hover:opacity-100"
              >
                Sign Out
              </button>
              <Link
                href={user.role === 'admin' ? '/admin' : '/dashboard/profile'}
                className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm hover:bg-primary-container transition-all"
              >
                {user.name[0].toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-slate-500 font-medium hover:text-slate-900 transition-all opacity-80 hover:opacity-100">
                Sign In
              </Link>
              <Link
                href="/spaces"
                className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-xl font-bold transition-transform active:scale-95 duration-200 shadow-lg shadow-primary/20"
              >
                Book Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-slate-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-8 py-6 space-y-4">
          <Link href="/spaces" className="block font-semibold text-primary" onClick={() => setMenuOpen(false)}>Find a Space</Link>
          <Link href="/spaces?type=Meeting+Room" className="block text-slate-500" onClick={() => setMenuOpen(false)}>Solutions</Link>
          <Link href="/spaces?type=Event+Space" className="block text-slate-500" onClick={() => setMenuOpen(false)}>Enterprise</Link>
          {user ? (
            <>
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="block text-slate-500" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-slate-500 w-full text-left">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block text-slate-500" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/auth/register" className="block bg-primary text-white px-4 py-2 rounded-xl font-bold text-center" onClick={() => setMenuOpen(false)}>Create Account</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
