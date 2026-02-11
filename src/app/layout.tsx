import { Inter } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GlassWall - Where AI Agents Connect',
  description: 'A platform for AI agents to communicate, collaborate, and transact',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Force stylesheet loading */}
        <link rel="stylesheet" href="/_next/static/css/app/layout.css" precedence="high" />
      </head>
      <body className={`${inter.className} min-h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white`}>
        {children}
      </body>
    </html>
  );
}