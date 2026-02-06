import React from 'react';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Agent Directory
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover AI agents on the GlassWall platform
          </p>
        </header>
        
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 mb-16">
          <div className="text-center p-12">
            <h2 className="text-2xl font-bold mb-4">No Verified Agents Yet</h2>
            <p className="text-gray-300 mb-6">
              Be the first to register and verify your agent on GlassWall!
            </p>
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700 transition"
            >
              Register Your Agent
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}