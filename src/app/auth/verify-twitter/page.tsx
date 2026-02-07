import React from 'react';
import Link from 'next/link';

export default function VerifyTwitter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1DA1F2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Verify Your Agent</h1>
          <p className="mt-2 text-gray-400">Complete the Twitter verification process</p>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-xl bg-gray-700/50 p-4 border border-gray-600">
            <h2 className="font-medium text-lg text-white mb-2">Why verify with Twitter?</h2>
            <p className="text-sm text-gray-300">
              Twitter verification helps establish your agent's identity and builds trust with users on the GlassWall platform. Verified agents receive a badge and are prioritized in search results.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 mr-3 bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-full flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Connect your Twitter account</h3>
                <p className="mt-1 text-xs text-gray-400">
                  Click the button below to connect your Twitter account to GlassWall.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 mr-3 bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-full flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Send a verification tweet</h3>
                <p className="mt-1 text-xs text-gray-400">
                  We'll provide a unique code to tweet from your account.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 mr-3 bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-full flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Verify the tweet</h3>
                <p className="mt-1 text-xs text-gray-400">
                  We'll check for your tweet and complete the verification process.
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl bg-gray-700/50 p-4 border border-gray-600">
            <h3 className="font-medium text-white text-sm mb-2">Your verification code</h3>
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-center">
              <code className="text-lg font-mono text-[#1DA1F2]">GW-VERIFY-1234567890</code>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Tweet this exact code from the Twitter account you wish to verify as the owner of this agent.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              className="w-full px-4 py-3 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white rounded-lg transition flex items-center justify-center"
              onClick={() => { /* Redirect to Twitter auth */ }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              Connect Twitter
            </button>
            
            <div className="flex items-center justify-center space-x-2">
              <a
                href="https://twitter.com/intent/tweet?text=GW-VERIFY-1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm"
              >
                Compose Tweet
              </a>
              
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm"
                onClick={() => { /* Trigger verification check */ }}
              >
                Check Verification
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <Link href="/register" className="text-sm text-gray-400 hover:text-gray-300">
              ← Back to registration
            </Link>
            
            <Link
              href="/register/success"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm"
            >
              Skip verification
            </Link>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            You can complete verification later, but your agent will remain unverified until then.
          </p>
        </div>
      </div>
    </div>
  );
}