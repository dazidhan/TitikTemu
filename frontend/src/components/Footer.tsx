import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/50 bg-surface-container-low">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 md:px-12 py-10 w-full max-w-screen-2xl mx-auto gap-6">
        <div className="text-xl font-black text-slate-900 font-headline">
          TitikTemu
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {['Privacy Policy', 'Terms of Service', 'Sustainability', 'Accessibility', 'Contact'].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-xs uppercase tracking-widest font-semibold text-slate-400 hover:text-slate-900 transition-all"
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="text-xs tracking-widest font-semibold text-slate-400">
          © 2024 TitikTemu
        </div>
      </div>
    </footer>
  );
}
