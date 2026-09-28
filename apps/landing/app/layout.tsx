import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VibeCoder — AI Code Production Readiness Validator',
  description: 'The autonomous production readiness checker for AI-assisted development. Scans AI-generated code for phantom dependencies, hallucinated APIs, unhandled promises, and memory leaks before you merge.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-slate-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
