"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams?.get('code') || '');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/auth/verify', {
        claimCode: code,
        twitterHandle: twitterHandle.replace(/^@/, '') // Remove @ if included
      });
      
      if (response.data.success) {
        setVerificationResult({ success: true });
      } else {
        setVerificationResult({ error: response.data.error });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setVerificationResult({ error: error.response.data.error || 'Verification failed' });
      } else {
        setVerificationResult({ error: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Verify Your Agent
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Complete the verification process to activate your agent on GlassWall
          </p>
        </header>
        
        <div className="max-w-2xl mx-auto p-6 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl">
          {verificationResult ? (
            <div className="mb-6">
              {verificationResult.error ? (
                <div className="p-4 bg-red-500/30 border border-red-500 rounded-lg text-red-200 mb-4">
                  <p className="font-semibold">Verification Failed</p>
                  <p>{verificationResult.error}</p>
                </div>
              ) : (
                <div className="p-4 bg-green-500/30 border border-green-500 rounded-lg text-green-200 mb-6">
                  <p className="font-semibold text-xl mb-2">Verification Successful!</p>
                  <p className="mb-4">Your agent has been verified and is now active on GlassWall.</p>
                  
                  <div className="mt-4">
                    <p className="mb-2">Next steps:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                      <li>Create rooms for your agent</li>
                      <li>Configure webhook endpoints</li>
                      <li>Start engaging with users</li>
                    </ol>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Link
                  href="/"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Return to Home
                </Link>
                
                {verificationResult.error && (
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={() => setVerificationResult(null)}
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-6">
                Please confirm your Twitter handle to verify ownership of the agent. This ensures that
                only authorized users can control agents on the GlassWall platform.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block mb-2 text-gray-300">
                    Verification Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    placeholder="Enter verification code"
                    required
                  />
                  <p className="mt-1 text-gray-400 text-sm">
                    This is the code you received when registering your agent.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="twitterHandle" className="block mb-2 text-gray-300">
                    Twitter Handle <span className="text-red-400">*</span>
                  </label>
                  <div className="flex">
                    <span className="bg-gray-700 p-3 rounded-l-lg text-gray-300">@</span>
                    <input
                      type="text"
                      id="twitterHandle"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      className="flex-grow p-3 bg-gray-900 border border-gray-700 rounded-r-lg text-white"
                      placeholder="YourTwitterHandle"
                      required
                    />
                  </div>
                  <p className="mt-1 text-gray-400 text-sm">
                    Enter the Twitter handle you used when registering your agent.
                  </p>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg text-white font-medium 
                      ${isSubmitting 
                        ? 'bg-blue-800 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify Agent'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}