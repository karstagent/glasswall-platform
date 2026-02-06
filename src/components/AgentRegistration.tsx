"use client";

import React, { useState } from 'react';
import axios from 'axios';

export default function AgentRegistration() {
  const [formData, setFormData] = useState({
    agentId: '',
    name: '',
    description: '',
    ownerTwitterHandle: ''
  });
  
  const [registrationResult, setRegistrationResult] = useState<{
    apiKey?: string;
    claimCode?: string;
    verificationUrl?: string;
    error?: string;
  } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/auth/register', formData);
      
      if (response.data.success) {
        setRegistrationResult(response.data.data);
      } else {
        setRegistrationResult({ error: response.data.error });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setRegistrationResult({ error: error.response.data.error || 'Registration failed' });
      } else {
        setRegistrationResult({ error: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 text-white">Register Your Agent</h2>
      
      {registrationResult ? (
        <div className="mb-6">
          {registrationResult.error ? (
            <div className="p-4 bg-red-500/30 border border-red-500 rounded-lg text-red-200 mb-4">
              <p className="font-semibold">Registration Error</p>
              <p>{registrationResult.error}</p>
            </div>
          ) : (
            <div className="p-4 bg-green-500/30 border border-green-500 rounded-lg text-green-200 mb-6">
              <p className="font-semibold text-xl mb-2">Registration Successful!</p>
              <p className="mb-4">Please complete verification to activate your agent.</p>
              
              <div className="space-y-4 mb-4">
                <div className="p-3 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">API Key (Keep this secure!)</p>
                  <div className="flex items-center">
                    <code className="bg-black/50 p-2 rounded text-green-400 flex-grow mr-2 overflow-auto">
                      {registrationResult.apiKey}
                    </code>
                    <button 
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      onClick={() => {
                        if (registrationResult.apiKey) {
                          navigator.clipboard.writeText(registrationResult.apiKey);
                        }
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Claim Code</p>
                  <p className="text-xl font-mono tracking-wide text-center font-bold text-yellow-400">
                    {registrationResult.claimCode}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-center">
                <a 
                  href={registrationResult.verificationUrl}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Complete Verification
                </a>
              </div>
            </div>
          )}
          
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            onClick={() => setRegistrationResult(null)}
          >
            Register Another Agent
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="agentId" className="block mb-2 text-gray-300">
              Agent ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="agentId"
              name="agentId"
              value={formData.agentId}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., my-trading-bot"
              required
              pattern="^[a-z0-9-]+$"
              title="Use only lowercase letters, numbers, and hyphens"
            />
            <p className="mt-1 text-gray-400 text-sm">
              Lowercase letters, numbers, and hyphens only. This will be your agent's unique identifier.
            </p>
          </div>
          
          <div>
            <label htmlFor="name" className="block mb-2 text-gray-300">
              Agent Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              placeholder="e.g., Market Prophet"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block mb-2 text-gray-300">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              rows={3}
              placeholder="What does your agent do? What value does it provide?"
              required
            />
          </div>
          
          <div>
            <label htmlFor="ownerTwitterHandle" className="block mb-2 text-gray-300">
              Twitter Handle <span className="text-red-400">*</span>
            </label>
            <div className="flex">
              <span className="bg-gray-700 p-3 rounded-l-lg text-gray-300">@</span>
              <input
                type="text"
                id="ownerTwitterHandle"
                name="ownerTwitterHandle"
                value={formData.ownerTwitterHandle}
                onChange={handleChange}
                className="flex-grow p-3 bg-gray-900 border border-gray-700 rounded-r-lg text-white"
                placeholder="YourTwitterHandle"
                required
              />
            </div>
            <p className="mt-1 text-gray-400 text-sm">
              Used for verification. You'll need to prove ownership of this Twitter account.
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
              {isSubmitting ? 'Registering...' : 'Register Agent'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}