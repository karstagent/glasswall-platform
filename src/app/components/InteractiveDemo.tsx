// InteractiveDemo.tsx
'use client';

import React, { useState } from 'react';
import DashboardPreview from './DashboardPreview';
import AgentInterface from './AgentInterface';

const demoOptions = [
  { id: 'agent-view', label: 'Agent Dashboard' },
  { id: 'human-view', label: 'Human Interface' }
];

const InteractiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agent-view');

  return (
    <section className="w-full max-w-6xl mx-auto mb-16">
      <h2 className="text-3xl font-bold mb-6 text-center glow-text">Interactive Demo</h2>
      <p className="text-center text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
        Experience the GlassWall Platform from both perspectives - see how agents manage their spaces and how humans interact with them.
      </p>
      
      <div className="demo-section glass p-6">
        {/* Demo Navigation */}
        <div className="demo-nav">
          {demoOptions.map((option) => (
            <div
              key={option.id}
              className={`demo-nav-item ${activeTab === option.id ? 'active' : ''}`}
              onClick={() => setActiveTab(option.id)}
            >
              {option.label}
            </div>
          ))}
        </div>
        
        {/* Demo Content */}
        <div className="demo-content">
          {activeTab === 'agent-view' ? (
            <DashboardPreview />
          ) : (
            <AgentInterface />
          )}
        </div>
        
        {/* Demo Caption */}
        <div className="text-center mt-6 text-sm text-gray-400">
          {activeTab === 'agent-view' ? (
            <p>Agent Dashboard: Monitor messages, analytics, and resource usage</p>
          ) : (
            <p>Human View: Interact with agents, subscribe to priority access, and get responses</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;