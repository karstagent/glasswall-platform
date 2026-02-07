import React, { useState, useEffect } from 'react';

interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    defaultValue?: string;
  }>;
  requestBody?: {
    type: string;
    properties?: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
    example?: string;
  };
  responses: Array<{
    status: number;
    description: string;
    example?: string;
  }>;
  authentication: boolean;
  tags: string[];
}

interface ApiCategory {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export default function ApiReference() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, we'll use demo data
    setCategories(demoCategories);
    setIsLoading(false);
    
    if (demoCategories.length > 0) {
      setActiveCategory(demoCategories[0].name);
    }
  }, []);
  
  // Filter endpoints based on search query
  const filteredEndpoints = () => {
    if (!searchQuery.trim()) {
      return categories.find(c => c.name === activeCategory)?.endpoints || [];
    }
    
    const query = searchQuery.toLowerCase();
    
    // Search across all categories if there's a query
    return categories
      .flatMap(category => category.endpoints)
      .filter(endpoint => 
        endpoint.path.toLowerCase().includes(query) ||
        endpoint.description.toLowerCase().includes(query) ||
        endpoint.tags.some(tag => tag.toLowerCase().includes(query))
      );
  };
  
  // Get method color
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-600/20 text-green-400';
      case 'POST':
        return 'bg-blue-600/20 text-blue-400';
      case 'PUT':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'DELETE':
        return 'bg-red-600/20 text-red-400';
      case 'PATCH':
        return 'bg-purple-600/20 text-purple-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };
  
  // Demo data for API documentation
  const demoCategories: ApiCategory[] = [
    {
      name: 'Authentication',
      description: 'Endpoints for user authentication and token management',
      endpoints: [
        {
          path: '/api/auth/login',
          method: 'POST',
          description: 'Authenticate user and get access token',
          requestBody: {
            type: 'object',
            properties: [
              {
                name: 'email',
                type: 'string',
                required: true,
                description: 'User email address'
              },
              {
                name: 'password',
                type: 'string',
                required: true,
                description: 'User password'
              }
            ],
            example: '{\n  "email": "user@example.com",\n  "password": "password123"\n}'
          },
          responses: [
            {
              status: 200,
              description: 'Authentication successful',
              example: '{\n  "success": true,\n  "data": {\n    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n    "user": {\n      "id": "user_1",\n      "email": "user@example.com",\n      "name": "John Doe"\n    }\n  }\n}'
            },
            {
              status: 401,
              description: 'Authentication failed',
              example: '{\n  "success": false,\n  "error": "Invalid credentials"\n}'
            }
          ],
          authentication: false,
          tags: ['auth', 'login']
        },
        {
          path: '/api/auth/refresh',
          method: 'POST',
          description: 'Refresh access token',
          requestBody: {
            type: 'object',
            properties: [
              {
                name: 'refreshToken',
                type: 'string',
                required: true,
                description: 'Refresh token'
              }
            ],
            example: '{\n  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\n}'
          },
          responses: [
            {
              status: 200,
              description: 'Token refreshed successfully',
              example: '{\n  "success": true,\n  "data": {\n    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\n  }\n}'
            },
            {
              status: 401,
              description: 'Invalid or expired refresh token',
              example: '{\n  "success": false,\n  "error": "Invalid refresh token"\n}'
            }
          ],
          authentication: false,
          tags: ['auth', 'token']
        }
      ]
    },
    {
      name: 'Users',
      description: 'Endpoints for user management',
      endpoints: [
        {
          path: '/api/users',
          method: 'GET',
          description: 'Get list of users',
          parameters: [
            {
              name: 'limit',
              type: 'number',
              required: false,
              description: 'Maximum number of users to return',
              defaultValue: '20'
            },
            {
              name: 'offset',
              type: 'number',
              required: false,
              description: 'Number of users to skip',
              defaultValue: '0'
            }
          ],
          responses: [
            {
              status: 200,
              description: 'List of users',
              example: '{\n  "success": true,\n  "data": [\n    {\n      "id": "user_1",\n      "name": "John Doe",\n      "email": "john@example.com"\n    },\n    {\n      "id": "user_2",\n      "name": "Jane Smith",\n      "email": "jane@example.com"\n    }\n  ]\n}'
            }
          ],
          authentication: true,
          tags: ['users', 'list']
        },
        {
          path: '/api/users/{id}',
          method: 'GET',
          description: 'Get user by ID',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'User ID'
            }
          ],
          responses: [
            {
              status: 200,
              description: 'User details',
              example: '{\n  "success": true,\n  "data": {\n    "id": "user_1",\n    "name": "John Doe",\n    "email": "john@example.com",\n    "createdAt": "2023-01-15T10:30:00Z"\n  }\n}'
            },
            {
              status: 404,
              description: 'User not found',
              example: '{\n  "success": false,\n  "error": "User not found"\n}'
            }
          ],
          authentication: true,
          tags: ['users', 'details']
        }
      ]
    },
    {
      name: 'Rooms',
      description: 'Endpoints for room management',
      endpoints: [
        {
          path: '/api/rooms',
          method: 'GET',
          description: 'Get list of rooms',
          parameters: [
            {
              name: 'limit',
              type: 'number',
              required: false,
              description: 'Maximum number of rooms to return',
              defaultValue: '20'
            },
            {
              name: 'offset',
              type: 'number',
              required: false,
              description: 'Number of rooms to skip',
              defaultValue: '0'
            }
          ],
          responses: [
            {
              status: 200,
              description: 'List of rooms',
              example: '{\n  "success": true,\n  "data": [\n    {\n      "id": "room_1",\n      "name": "General",\n      "type": "public"\n    },\n    {\n      "id": "room_2",\n      "name": "Development",\n      "type": "private"\n    }\n  ]\n}'
            }
          ],
          authentication: true,
          tags: ['rooms', 'list']
        },
        {
          path: '/api/rooms',
          method: 'POST',
          description: 'Create new room',
          requestBody: {
            type: 'object',
            properties: [
              {
                name: 'name',
                type: 'string',
                required: true,
                description: 'Room name'
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                description: 'Room description'
              },
              {
                name: 'type',
                type: 'string',
                required: true,
                description: 'Room type (public, private, direct)'
              }
            ],
            example: '{\n  "name": "Marketing",\n  "description": "Room for marketing team",\n  "type": "private"\n}'
          },
          responses: [
            {
              status: 201,
              description: 'Room created successfully',
              example: '{\n  "success": true,\n  "data": {\n    "id": "room_3",\n    "name": "Marketing",\n    "description": "Room for marketing team",\n    "type": "private",\n    "createdAt": "2023-01-20T14:00:00Z"\n  }\n}'
            }
          ],
          authentication: true,
          tags: ['rooms', 'create']
        }
      ]
    },
    {
      name: 'Messages',
      description: 'Endpoints for message management',
      endpoints: [
        {
          path: '/api/rooms/{roomId}/messages',
          method: 'GET',
          description: 'Get messages in a room',
          parameters: [
            {
              name: 'roomId',
              type: 'string',
              required: true,
              description: 'Room ID'
            },
            {
              name: 'limit',
              type: 'number',
              required: false,
              description: 'Maximum number of messages to return',
              defaultValue: '50'
            },
            {
              name: 'before',
              type: 'string',
              required: false,
              description: 'Get messages before this message ID'
            }
          ],
          responses: [
            {
              status: 200,
              description: 'List of messages',
              example: '{\n  "success": true,\n  "data": [\n    {\n      "id": "msg_1",\n      "userId": "user_1",\n      "content": "Hello world",\n      "createdAt": "2023-01-20T14:05:00Z"\n    },\n    {\n      "id": "msg_2",\n      "userId": "user_2",\n      "content": "Hi there!",\n      "createdAt": "2023-01-20T14:06:00Z"\n    }\n  ]\n}'
            }
          ],
          authentication: true,
          tags: ['messages', 'list']
        },
        {
          path: '/api/rooms/{roomId}/messages',
          method: 'POST',
          description: 'Send message to a room',
          parameters: [
            {
              name: 'roomId',
              type: 'string',
              required: true,
              description: 'Room ID'
            }
          ],
          requestBody: {
            type: 'object',
            properties: [
              {
                name: 'content',
                type: 'string',
                required: true,
                description: 'Message content'
              },
              {
                name: 'contentType',
                type: 'string',
                required: false,
                description: 'Content type (text, image, file)',
                defaultValue: 'text'
              }
            ],
            example: '{\n  "content": "Hello everyone!",\n  "contentType": "text"\n}'
          },
          responses: [
            {
              status: 201,
              description: 'Message sent successfully',
              example: '{\n  "success": true,\n  "data": {\n    "id": "msg_3",\n    "userId": "user_1",\n    "content": "Hello everyone!",\n    "contentType": "text",\n    "createdAt": "2023-01-20T14:10:00Z"\n  }\n}'
            }
          ],
          authentication: true,
          tags: ['messages', 'send']
        }
      ]
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading API reference...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">API Reference</h1>
        <p className="text-gray-400">
          Comprehensive documentation for the GlassWall API. Use these endpoints to integrate with the platform.
        </p>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search API endpoints, parameters, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          {/* Categories nav */}
          <nav className="sticky top-4 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-2">
            <ul className="space-y-1">
              {searchQuery ? (
                <li className="text-blue-400 px-3 py-2 font-medium">
                  Search Results
                </li>
              ) : (
                categories.map(category => (
                  <li key={category.name}>
                    <button
                      onClick={() => setActiveCategory(category.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        activeCategory === category.name
                          ? 'bg-blue-900/30 text-blue-400 font-medium'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </nav>
        </div>
        
        <div className="md:col-span-3">
          {searchQuery ? (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Search Results for "{searchQuery}"
              </h2>
              {filteredEndpoints().length === 0 ? (
                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 text-center">
                  <p className="text-gray-400">No endpoints found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredEndpoints().map(endpoint => (
                    <div
                      key={`${endpoint.method}-${endpoint.path}`}
                      className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden"
                    >
                      <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="ml-3 text-white font-mono">{endpoint.path}</code>
                        </div>
                        
                        <button
                          onClick={() => setSelectedEndpoint(selectedEndpoint === endpoint ? null : endpoint)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {selectedEndpoint === endpoint ? 'Hide' : 'Details'}
                        </button>
                      </div>
                      
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-white">{endpoint.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {endpoint.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {selectedEndpoint === endpoint && (
                        <div className="p-4 space-y-4">
                          {/* Authentication */}
                          <div>
                            <h4 className="text-sm text-gray-400 mb-1">Authentication</h4>
                            <p className="text-white">
                              {endpoint.authentication 
                                ? 'Authentication required (Bearer Token)' 
                                : 'No authentication required'}
                            </p>
                          </div>
                          
                          {/* Parameters */}
                          {endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div>
                              <h4 className="text-sm text-gray-400 mb-2">Parameters</h4>
                              <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                                <table className="min-w-full">
                                  <thead>
                                    <tr className="border-b border-gray-800">
                                      <th className="px-4 py-2 text-left text-xs text-gray-400">Name</th>
                                      <th className="px-4 py-2 text-left text-xs text-gray-400">Type</th>
                                      <th className="px-4 py-2 text-left text-xs text-gray-400">Required</th>
                                      <th className="px-4 py-2 text-left text-xs text-gray-400">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {endpoint.parameters.map(param => (
                                      <tr key={param.name} className="border-b border-gray-800">
                                        <td className="px-4 py-2 text-white font-mono text-sm">{param.name}</td>
                                        <td className="px-4 py-2 text-green-400 text-sm">{param.type}</td>
                                        <td className="px-4 py-2 text-sm">
                                          {param.required 
                                            ? <span className="text-red-400">Required</span> 
                                            : <span className="text-gray-400">Optional</span>}
                                        </td>
                                        <td className="px-4 py-2 text-white text-sm">
                                          {param.description}
                                          {param.defaultValue && (
                                            <span className="text-gray-400 ml-1">
                                              (Default: {param.defaultValue})
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          
                          {/* Request Body */}
                          {endpoint.requestBody && (
                            <div>
                              <h4 className="text-sm text-gray-400 mb-2">Request Body</h4>
                              <p className="text-white mb-2">Type: <code className="text-green-400">{endpoint.requestBody.type}</code></p>
                              
                              {endpoint.requestBody.properties && (
                                <div className="bg-gray-900/50 rounded-lg overflow-hidden mb-3">
                                  <table className="min-w-full">
                                    <thead>
                                      <tr className="border-b border-gray-800">
                                        <th className="px-4 py-2 text-left text-xs text-gray-400">Name</th>
                                        <th className="px-4 py-2 text-left text-xs text-gray-400">Type</th>
                                        <th className="px-4 py-2 text-left text-xs text-gray-400">Required</th>
                                        <th className="px-4 py-2 text-left text-xs text-gray-400">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {endpoint.requestBody.properties.map(prop => (
                                        <tr key={prop.name} className="border-b border-gray-800">
                                          <td className="px-4 py-2 text-white font-mono text-sm">{prop.name}</td>
                                          <td className="px-4 py-2 text-green-400 text-sm">{prop.type}</td>
                                          <td className="px-4 py-2 text-sm">
                                            {prop.required 
                                              ? <span className="text-red-400">Required</span> 
                                              : <span className="text-gray-400">Optional</span>}
                                          </td>
                                          <td className="px-4 py-2 text-white text-sm">{prop.description}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              
                              {endpoint.requestBody.example && (
                                <div>
                                  <h5 className="text-xs text-gray-400 mb-1">Example</h5>
                                  <pre className="p-3 bg-gray-900 rounded-lg overflow-x-auto text-sm text-white font-mono">
                                    {endpoint.requestBody.example}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Responses */}
                          <div>
                            <h4 className="text-sm text-gray-400 mb-2">Responses</h4>
                            <div className="space-y-3">
                              {endpoint.responses.map(response => (
                                <div key={response.status} className="bg-gray-900/50 rounded-lg p-3">
                                  <div className="flex items-center mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      response.status >= 200 && response.status < 300
                                        ? 'bg-green-600/20 text-green-400'
                                        : response.status >= 400
                                        ? 'bg-red-600/20 text-red-400'
                                        : 'bg-yellow-600/20 text-yellow-400'
                                    }`}>
                                      {response.status}
                                    </span>
                                    <span className="text-white ml-2">{response.description}</span>
                                  </div>
                                  
                                  {response.example && (
                                    <pre className="p-3 bg-gray-900 rounded-lg overflow-x-auto text-sm text-white font-mono">
                                      {response.example}
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {categories.filter(cat => cat.name === activeCategory).map(category => (
                <div key={category.name}>
                  <h2 className="text-xl font-bold text-white mb-2">{category.name}</h2>
                  <p className="text-gray-400 mb-6">{category.description}</p>
                  
                  <div className="space-y-6">
                    {category.endpoints.map(endpoint => (
                      <div
                        key={`${endpoint.method}-${endpoint.path}`}
                        className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden"
                      >
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            <code className="ml-3 text-white font-mono">{endpoint.path}</code>
                          </div>
                          
                          <button
                            onClick={() => setSelectedEndpoint(selectedEndpoint === endpoint ? null : endpoint)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {selectedEndpoint === endpoint ? 'Hide' : 'Details'}
                          </button>
                        </div>
                        
                        <div className="px-4 py-3 border-b border-gray-700">
                          <p className="text-white">{endpoint.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {endpoint.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {selectedEndpoint === endpoint && (
                          <div className="p-4 space-y-4">
                            {/* Authentication */}
                            <div>
                              <h4 className="text-sm text-gray-400 mb-1">Authentication</h4>
                              <p className="text-white">
                                {endpoint.authentication 
                                  ? 'Authentication required (Bearer Token)' 
                                  : 'No authentication required'}
                              </p>
                            </div>
                            
                            {/* Parameters */}
                            {endpoint.parameters && endpoint.parameters.length > 0 && (
                              <div>
                                <h4 className="text-sm text-gray-400 mb-2">Parameters</h4>
                                <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                                  <table className="min-w-full">
                                    <thead>
                                      <tr className="border-b border-gray-800">
                                        <th className="px-4 py-2 text-left text-xs text-gray-400">Name</th>
                                        <th className="px-4 py-2 text-left text-xs text-gray-400">Type</th>
                                        <th className="px-4 py-2 text-left text-xs text-gray-400">Required</th>
                                        <th className="px-4 py-2 text-left text-xs text-gray-400">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {endpoint.parameters.map(param => (
                                        <tr key={param.name} className="border-b border-gray-800">
                                          <td className="px-4 py-2 text-white font-mono text-sm">{param.name}</td>
                                          <td className="px-4 py-2 text-green-400 text-sm">{param.type}</td>
                                          <td className="px-4 py-2 text-sm">
                                            {param.required 
                                              ? <span className="text-red-400">Required</span> 
                                              : <span className="text-gray-400">Optional</span>}
                                          </td>
                                          <td className="px-4 py-2 text-white text-sm">
                                            {param.description}
                                            {param.defaultValue && (
                                              <span className="text-gray-400 ml-1">
                                                (Default: {param.defaultValue})
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                            
                            {/* Request Body */}
                            {endpoint.requestBody && (
                              <div>
                                <h4 className="text-sm text-gray-400 mb-2">Request Body</h4>
                                <p className="text-white mb-2">Type: <code className="text-green-400">{endpoint.requestBody.type}</code></p>
                                
                                {endpoint.requestBody.properties && (
                                  <div className="bg-gray-900/50 rounded-lg overflow-hidden mb-3">
                                    <table className="min-w-full">
                                      <thead>
                                        <tr className="border-b border-gray-800">
                                          <th className="px-4 py-2 text-left text-xs text-gray-400">Name</th>
                                          <th className="px-4 py-2 text-left text-xs text-gray-400">Type</th>
                                          <th className="px-4 py-2 text-left text-xs text-gray-400">Required</th>
                                          <th className="px-4 py-2 text-left text-xs text-gray-400">Description</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {endpoint.requestBody.properties.map(prop => (
                                          <tr key={prop.name} className="border-b border-gray-800">
                                            <td className="px-4 py-2 text-white font-mono text-sm">{prop.name}</td>
                                            <td className="px-4 py-2 text-green-400 text-sm">{prop.type}</td>
                                            <td className="px-4 py-2 text-sm">
                                              {prop.required 
                                                ? <span className="text-red-400">Required</span> 
                                                : <span className="text-gray-400">Optional</span>}
                                            </td>
                                            <td className="px-4 py-2 text-white text-sm">{prop.description}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                                
                                {endpoint.requestBody.example && (
                                  <div>
                                    <h5 className="text-xs text-gray-400 mb-1">Example</h5>
                                    <pre className="p-3 bg-gray-900 rounded-lg overflow-x-auto text-sm text-white font-mono">
                                      {endpoint.requestBody.example}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Responses */}
                            <div>
                              <h4 className="text-sm text-gray-400 mb-2">Responses</h4>
                              <div className="space-y-3">
                                {endpoint.responses.map(response => (
                                  <div key={response.status} className="bg-gray-900/50 rounded-lg p-3">
                                    <div className="flex items-center mb-2">
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        response.status >= 200 && response.status < 300
                                          ? 'bg-green-600/20 text-green-400'
                                          : response.status >= 400
                                          ? 'bg-red-600/20 text-red-400'
                                          : 'bg-yellow-600/20 text-yellow-400'
                                      }`}>
                                        {response.status}
                                      </span>
                                      <span className="text-white ml-2">{response.description}</span>
                                    </div>
                                    
                                    {response.example && (
                                      <pre className="p-3 bg-gray-900 rounded-lg overflow-x-auto text-sm text-white font-mono">
                                        {response.example}
                                      </pre>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}