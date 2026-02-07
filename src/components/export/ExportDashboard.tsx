import React, { useState, useEffect } from 'react';
import exportService, { ExportTypeDefinition, ExportFormat, ExportRequest, ExportOptions } from '@/services/ExportService';
import { formatDistanceToNow } from 'date-fns';

export default function ExportDashboard() {
  const [exportTypes, setExportTypes] = useState<ExportTypeDefinition[]>([]);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [exportName, setExportName] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Load export types
    setExportTypes(exportService.getExportTypes());
    
    // Fetch export requests
    fetchExportRequests();
  }, []);
  
  useEffect(() => {
    // Set default format when export type changes
    if (selectedType) {
      const exportType = exportTypes.find(type => type.id === selectedType);
      if (exportType) {
        setSelectedFormat(exportType.defaultFormat);
      }
    }
  }, [selectedType, exportTypes]);
  
  const fetchExportRequests = async () => {
    setIsLoading(true);
    
    try {
      const response = await exportService.getExports();
      
      if (response.success && response.data) {
        setExportRequests(response.data);
      } else {
        console.error('Failed to fetch export requests:', response.error);
      }
    } catch (err) {
      console.error('Error fetching export requests:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateExport = async () => {
    if (!selectedType) {
      setError('Please select an export type');
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    
    try {
      const options: ExportOptions = {
        format: selectedFormat
      };
      
      // Add date range if provided
      if (dateRange.start && dateRange.end) {
        options.startDate = dateRange.start;
        options.endDate = dateRange.end;
      }
      
      const response = await exportService.createExport(
        selectedType,
        options,
        exportName || undefined
      );
      
      if (response.success && response.data) {
        setSuccessMessage('Export request created successfully');
        setExportRequests(prev => [response.data, ...prev]);
        
        // Reset form
        setSelectedType('');
        setExportName('');
        setDateRange({ start: '', end: '' });
        setIsCreating(false);
      } else {
        setError(response.error || 'Failed to create export request');
      }
    } catch (err) {
      console.error('Error creating export:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteExport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this export?')) {
      return;
    }
    
    try {
      const response = await exportService.deleteExport(id);
      
      if (response.success) {
        // Update the list
        setExportRequests(prev => prev.filter(req => req.id !== id));
        setSuccessMessage('Export deleted successfully');
      } else {
        setError(response.error || 'Failed to delete export');
      }
    } catch (err) {
      console.error('Error deleting export:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleCancelExport = async (id: string) => {
    try {
      const response = await exportService.cancelExport(id);
      
      if (response.success) {
        // Update the status of the export request
        setExportRequests(prev => prev.map(req => 
          req.id === id 
            ? { ...req, status: 'failed', error: 'Cancelled by user' } 
            : req
        ));
        setSuccessMessage('Export cancelled successfully');
      } else {
        setError(response.error || 'Failed to cancel export');
      }
    } catch (err) {
      console.error('Error cancelling export:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'processing':
        return 'bg-blue-600/20 text-blue-400';
      case 'completed':
        return 'bg-green-600/20 text-green-400';
      case 'failed':
        return 'bg-red-600/20 text-red-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Data Export</h2>
        
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          disabled={isCreating}
        >
          New Export
        </button>
      </div>
      
      {error && (
        <div className="bg-red-800/30 border border-red-600 rounded-lg p-4 text-white">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-800/30 border border-green-600 rounded-lg p-4 text-white">
          {successMessage}
        </div>
      )}
      
      {isCreating && (
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Create New Export</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="exportType" className="block mb-2 text-sm text-gray-300">
                Export Type*
              </label>
              <select
                id="exportType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                required
              >
                <option value="">Select Export Type</option>
                {exportTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {selectedType && (
                <p className="mt-1 text-sm text-gray-400">
                  {exportTypes.find(t => t.id === selectedType)?.description}
                </p>
              )}
            </div>
            
            {selectedType && (
              <>
                <div>
                  <label htmlFor="exportName" className="block mb-2 text-sm text-gray-300">
                    Export Name (Optional)
                  </label>
                  <input
                    id="exportName"
                    value={exportName}
                    onChange={(e) => setExportName(e.target.value)}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    placeholder="Enter a name for this export"
                  />
                </div>
                
                <div>
                  <label htmlFor="exportFormat" className="block mb-2 text-sm text-gray-300">
                    Format
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {exportTypes
                      .find(t => t.id === selectedType)
                      ?.availableFormats.map(format => (
                        <label key={format} className={`
                          flex items-center p-3 border rounded-lg cursor-pointer
                          ${selectedFormat === format 
                            ? 'border-blue-500 bg-blue-900/20' 
                            : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'}
                        `}>
                          <input
                            type="radio"
                            name="exportFormat"
                            value={format}
                            checked={selectedFormat === format}
                            onChange={() => setSelectedFormat(format)}
                            className="hidden"
                          />
                          <img 
                            src={exportService.getFormatIcon(format)} 
                            alt={format} 
                            className="w-6 h-6 mr-2" 
                          />
                          <span className="text-white capitalize">{format}</span>
                        </label>
                      ))
                    }
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block mb-2 text-sm text-gray-300">
                      Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block mb-2 text-sm text-gray-300">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 border border-gray-600 rounded-lg text-white hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCreateExport}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                    disabled={isLoading || !selectedType}
                  >
                    {isLoading ? 'Creating...' : 'Create Export'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">
            Your Exports
          </h3>
        </div>
        
        {isLoading && exportRequests.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-blue-500 rounded-full animate-spin mb-2"></div>
              <p className="text-gray-400">Loading exports...</p>
            </div>
          </div>
        ) : exportRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            You haven't created any exports yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {exportRequests.map(request => (
              <div key={request.id} className="p-4 hover:bg-gray-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-white">{request.name}</h4>
                    <p className="text-gray-400 text-sm">{request.dataType}</p>
                  </div>
                  
                  <div className="flex items-center mt-2 md:mt-0">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      {formatTimestamp(request.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="capitalize">
                      {request.options.format}
                    </span>
                  </div>
                  
                  {request.fileSize && (
                    <div className="text-sm text-gray-400">
                      {exportService.formatFileSize(request.fileSize)}
                    </div>
                  )}
                  
                  {request.options.startDate && request.options.endDate && (
                    <div className="text-sm text-gray-400">
                      {new Date(request.options.startDate).toLocaleDateString()} - 
                      {new Date(request.options.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  {request.status === 'completed' && request.url && (
                    <a
                      href={request.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded text-sm"
                    >
                      Download
                    </a>
                  )}
                  
                  {(request.status === 'pending' || request.status === 'processing') && (
                    <button
                      onClick={() => handleCancelExport(request.id)}
                      className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 rounded text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteExport(request.id)}
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}