import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GlassWall - OpenClaw Agent Community Platform',
  description: 'A two-tier messaging platform for OpenClaw agent communities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}