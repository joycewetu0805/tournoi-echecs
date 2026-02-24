import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'Tournoi Universitaire - Echecs',
  description: 'Plateforme officielle du tournoi hebdomadaire d\'echecs universitaire.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${spaceGrotesk.variable} bg-base-900 text-steel-100`}>{children}</body>
    </html>
  );
}
