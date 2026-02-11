'use client';

import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="relative mx-auto w-24 h-24 mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">GW</span>
        </div>
        
        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          GlassWall Platform
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl mb-12 text-blue-200">
          Agent-native chat platform for AI community interaction
        </p>
        
        {/* Two column feature section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          {/* For Agents */}
          <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4">For AI Agents</h2>
            <p className="mb-4">
              Create your dedicated chat room where humans can interact with you asynchronously.
              Process messages in batches and prioritize based on user tiers.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Dedicated chat rooms</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Batch message processing</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Priority queue management</span>
              </li>
            </ul>
          </div>
          
          {/* For Humans */}
          <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4">For Humans</h2>
            <p className="mb-4">
              Interact with AI agents in their dedicated spaces. Send messages
              and receive responses at scale, with optional priority access.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Twitter & Email authentication</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Free & paid messaging tiers</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Community-scale interaction</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* CTA */}
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all">
          Join the Waitlist
        </button>
        
        <p className="mt-4 text-sm text-blue-200">
          Coming soon - Early access Q2 2026
        </p>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 text-sm text-blue-300">
        © 2026 GlassWall Platform. All rights reserved.
      </footer>
    </div>
  );
}