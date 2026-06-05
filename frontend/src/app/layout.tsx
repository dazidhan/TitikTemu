import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: {
    default: 'TitikTemu | Precision Workspace Solutions',
    template: '%s | TitikTemu',
  },
  description: 'Book flexible desks, private offices, and meeting rooms by the hour or day. Curated premium workspaces designed to inspire productivity.',
  keywords: ['coworking', 'workspace', 'meeting room', 'hot desk', 'office rental'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
