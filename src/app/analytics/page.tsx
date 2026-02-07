import React from 'react';
import Header from '../components/Header';
import AnalyticsCard from '../components/AnalyticsCard';

export default function AnalyticsPage() {
  // Mock data for user activity
  const userActivityData = [
    { label: 'Jan 01', value: 45 },
    { label: 'Jan 08', value: 62 },
    { label: 'Jan 15', value: 58 },
    { label: 'Jan 22', value: 78 },
    { label: 'Jan 29', value: 85 },
    { label: 'Feb 05', value: 92 },
  ];
  
  // Mock data for messages
  const messageData = [
    { label: 'Jan 01', value: 125 },
    { label: 'Jan 08', value: 243 },
    { label: 'Jan 15', value: 198 },
    { label: 'Jan 22', value: 327 },
    { label: 'Jan 29', value: 356 },
    { label: 'Feb 05', value: 410 },
  ];
  
  // Mock data for agent response time
  const responseTimeData = [
    { label: 'Jan 01', value: 2.8 },
    { label: 'Jan 08', value: 2.5 },
    { label: 'Jan 15', value: 2.3 },
    { label: 'Jan 22', value: 1.9 },
    { label: 'Jan 29', value: 1.7 },
    { label: 'Feb 05', value: 1.5 },
  ];
  
  // Mock data for webhook deliveries
  const webhookData = [
    { label: 'Jan 01', value: 98 },
    { label: 'Jan 08', value: 96 },
    { label: 'Jan 15', value: 99 },
    { label: 'Jan 22', value: 97 },
    { label: 'Jan 29', value: 98 },
    { label: 'Feb 05', value: 100 },
  ];
  
  // Mock data for priority vs standard messages
  const messageTypeData = {
    priority: 863,
    standard: 3427,
  };
  
  // Mock data for agent performance metrics
  const agentPerformanceData = [
    { agent: 'CryptoAnalyst', responseTime: 1.2, satisfactionRate: 98, messageCount: 2458 },
    { agent: 'CodeWizard', responseTime: 1.8, satisfactionRate: 96, messageCount: 1837 },
    { agent: 'HealthCoach', responseTime: 1.5, satisfactionRate: 97, messageCount: 1245 },
    { agent: 'LegalAdvisor', responseTime: 2.2, satisfactionRate: 94, messageCount: 876 },
    { agent: 'CreativeDesigner', responseTime: 1.9, satisfactionRate: 95, messageCount: 1542 },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Analytics Dashboard</h1>
              <p className="text-gray-400 mt-1">Insights and metrics for your GlassWall platform</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select className="pl-3 pr-10 py-2 appearance-none bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option selected>Last 90 days</option>
                  <option>Custom range</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export Report
              </button>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Users"
            value="1,247"
            trend={{ value: 12, isPositive: true, label: "vs last month" }}
            data={userActivityData}
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            }
          />
          
          <AnalyticsCard
            title="Total Messages"
            value="4,290"
            trend={{ value: 18, isPositive: true, label: "vs last month" }}
            data={messageData}
            color="purple"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            }
          />
          
          <AnalyticsCard
            title="Avg. Response Time"
            value="1.5s"
            trend={{ value: 28, isPositive: true, label: "faster" }}
            data={responseTimeData}
            color="green"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
          />
          
          <AnalyticsCard
            title="Webhook Success Rate"
            value="99.8%"
            trend={{ value: 2, isPositive: true }}
            data={webhookData}
            color="amber"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
        
        {/* Message Types */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Message Types</h2>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-400 bg-amber-900/30">
                    Priority
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-amber-400">
                    {messageTypeData.priority} ({Math.round((messageTypeData.priority / (messageTypeData.priority + messageTypeData.standard)) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                <div style={{ width: `${(messageTypeData.priority / (messageTypeData.priority + messageTypeData.standard)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
              </div>
              
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-400 bg-blue-900/30">
                    Standard
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-400">
                    {messageTypeData.standard} ({Math.round((messageTypeData.standard / (messageTypeData.priority + messageTypeData.standard)) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                <div style={{ width: `${(messageTypeData.standard / (messageTypeData.priority + messageTypeData.standard)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Key Insights</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Priority messages receive responses 43% faster on average
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Priority usage increased by 18% in the last month
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Weekend priority message volume is 32% lower than weekdays
                </li>
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white">Agent Performance</h2>
              
              <div className="flex space-x-2">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  Response Time
                </span>
                <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                  Satisfaction
                </span>
                <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                  Volume
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Agent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Avg. Response
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Satisfaction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Messages
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Overall
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {agentPerformanceData.map((agent, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={`https://randomuser.me/api/portraits/men/${index + 1}.jpg`}
                            alt={agent.agent}
                            className="w-8 h-8 rounded-full border border-gray-700"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">{agent.agent}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{agent.responseTime.toFixed(1)}s</div>
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-1">
                          <div 
                            className="h-1.5 bg-gray-400 rounded-full" 
                            style={{ width: `${100 - (agent.responseTime / 3 * 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{agent.satisfactionRate}%</div>
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-1">
                          <div 
                            className="h-1.5 bg-green-500 rounded-full" 
                            style={{ width: `${agent.satisfactionRate}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{agent.messageCount.toLocaleString()}</div>
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-1">
                          <div 
                            className="h-1.5 bg-blue-500 rounded-full" 
                            style={{ width: `${(agent.messageCount / 2500) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-400">
                          Excellent
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}