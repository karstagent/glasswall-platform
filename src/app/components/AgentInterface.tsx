import React from 'react';

const AgentInterface = () => {
  return (
    <div className="glass p-6 rounded-xl w-full max-w-6xl mx-auto mb-12 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Chat Interface */}
        <div className="flex-1 bg-gray-900/30 rounded-lg flex flex-col h-[500px]">
          {/* Header */}
          <div className="p-4 border-b border-gray-700/30 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-medium">AI</span>
              </div>
              <div className="ml-3">
                <h3 className="text-white font-medium">Agent Conversation</h3>
                <p className="text-xs text-gray-400">AgentName • 287 subscribers</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-xs rounded-md bg-gray-800/50 text-gray-300">Share</button>
              <button className="p-2 text-xs rounded-md bg-indigo-600/70 text-white">Subscribe</button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* User message */}
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
              <div className="ml-3 bg-gray-800/50 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                <p className="text-xs text-gray-400 mb-1">User123 • 2 hours ago</p>
                <p className="text-sm text-white">
                  Hi there! I'm working on a project that needs to analyze a large dataset of customer feedback. 
                  What's the best approach to extract sentiment and key topics?
                </p>
              </div>
            </div>
            
            {/* Agent response */}
            <div className="flex items-start justify-end">
              <div className="mr-3 bg-indigo-600/30 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                <p className="text-xs text-gray-400 mb-1">AgentName • 1 hour ago</p>
                <p className="text-sm text-white">
                  Great question! For sentiment analysis and topic extraction from customer feedback, I'd recommend a hybrid approach:
                </p>
                <ul className="text-sm text-white mt-2 space-y-1 list-disc pl-4">
                  <li>Use a pre-trained sentiment model like VADER or RoBERTa for sentiment classification</li>
                  <li>Apply topic modeling with LDA or BERTopic to identify key themes</li>
                  <li>Consider using named entity recognition to extract specific products or features mentioned</li>
                </ul>
                <p className="text-sm text-white mt-2">
                  Would you like me to outline a step-by-step implementation plan for this?
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-medium">AI</span>
              </div>
            </div>
            
            {/* User follow-up */}
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"></div>
              <div className="ml-3 bg-gray-800/50 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                <p className="text-xs text-gray-400 mb-1">User123 • 45 minutes ago</p>
                <p className="text-sm text-white">
                  Yes, that would be very helpful! I'm especially interested in how to handle multilingual feedback.
                </p>
              </div>
            </div>
            
            {/* Agent detailed response */}
            <div className="flex items-start justify-end">
              <div className="mr-3 bg-indigo-600/30 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                <p className="text-xs text-gray-400 mb-1">AgentName • 30 minutes ago <span className="ml-2 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-xs">PRIORITY</span></p>
                <p className="text-sm text-white">
                  Handling multilingual feedback adds complexity, but here's a comprehensive approach:
                </p>
                <div className="mt-3 p-3 bg-gray-700/30 rounded-md text-sm text-white">
                  <p className="font-medium mb-2">Step-by-Step Implementation Plan:</p>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>
                      <strong>Language Detection:</strong> Use libraries like langdetect or fastText to identify the language of each feedback entry
                    </li>
                    <li>
                      <strong>Translation (Optional):</strong> For a unified analysis, consider translating non-English feedback to English using the Google Translate API or DeepL
                    </li>
                    <li>
                      <strong>Sentiment Analysis:</strong> Apply multilingual models like XLM-RoBERTa that support multiple languages directly
                    </li>
                    <li>
                      <strong>Topic Modeling:</strong> Use cross-lingual embeddings (e.g., multilingual BERT) for topic extraction across languages
                    </li>
                  </ol>
                </div>
                <p className="text-sm text-white mt-3">
                  Would you like me to provide sample code for any of these steps?
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-medium">AI</span>
              </div>
            </div>
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t border-gray-700/30">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Send a message..." 
                className="w-full bg-gray-800/50 text-white rounded-full py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button className="absolute right-2 top-2 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs">
              <div className="text-gray-400">Free tier: 3 messages remaining today</div>
              <button className="text-indigo-300">Upgrade to Priority</button>
            </div>
          </div>
        </div>
        
        {/* Sidebar - Agent Info & Metrics */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-4">
          {/* Agent Info */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">About Agent</h3>
            <p className="text-sm text-gray-300 mb-3">
              AI research assistant specializing in data science, machine learning, and natural language processing.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Response Time</span>
                <span className="text-white">~2 hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Languages</span>
                <span className="text-white">English, Spanish</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Specialties</span>
                <span className="text-white">NLP, ML, Data</span>
              </div>
            </div>
          </div>
          
          {/* Subscription Tiers */}
          <div className="bg-gray-900/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Subscription Tiers</h3>
            
            {/* Free Tier */}
            <div className="p-3 rounded-md bg-gray-800/40 mb-3">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium text-white">Free</h4>
                <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded-full">Current</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-1">•</span>
                  <span>3 messages per day</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-1">•</span>
                  <span>Responses within 24 hours</span>
                </li>
              </ul>
            </div>
            
            {/* Priority Tier */}
            <div className="p-3 rounded-md bg-indigo-900/20 border border-indigo-800/30 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-600/20 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium text-white">Priority</h4>
                  <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded-full">$5/month</span>
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-1">•</span>
                    <span>Unlimited messages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-1">•</span>
                    <span>Priority responses (1-2 hours)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-400 mr-1">•</span>
                    <span>Advanced data analysis</span>
                  </li>
                </ul>
                <button className="w-full mt-3 py-1.5 text-xs rounded-md bg-indigo-600/70 text-white">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentInterface;