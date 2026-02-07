#!/usr/bin/env node

/**
 * GlassWall Metrics Upload Script
 * 
 * This script uploads collected metrics to a monitoring service for
 * visualization and alerting.
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Environment variables
const METRICS_API_KEY = process.env.METRICS_API_KEY;
const METRICS_ENDPOINT = process.env.METRICS_ENDPOINT || 'https://metrics.glasswall.app/api/metrics';

// Get the current date
const today = new Date();
const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

// Path to metrics file
const metricsDir = path.join(__dirname, '..', 'metrics');
const metricsFilePath = path.join(metricsDir, `metrics-${dateString}.json`);

async function uploadMetrics() {
  console.log(`Uploading metrics from ${metricsFilePath}...`);
  
  try {
    // Check if metrics file exists
    if (!fs.existsSync(metricsFilePath)) {
      console.error(`Metrics file not found: ${metricsFilePath}`);
      console.log('Running collection script first...');
      
      // Import and run the collection script
      const collectMetrics = require('./collect-metrics');
      await collectMetrics();
    }
    
    // Read metrics from file
    const metricsData = JSON.parse(fs.readFileSync(metricsFilePath, 'utf-8'));
    
    // Upload metrics to endpoint
    const response = await fetch(METRICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${METRICS_API_KEY}`,
        'User-Agent': 'GlassWall-Metrics-Uploader/1.0',
      },
      body: JSON.stringify(metricsData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload metrics: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const result = await response.json();
    console.log('Metrics uploaded successfully:', result);
    
    // Update metrics with upload status
    metricsData.uploadStatus = {
      timestamp: new Date().toISOString(),
      success: true,
      endpoint: METRICS_ENDPOINT,
    };
    
    fs.writeFileSync(metricsFilePath, JSON.stringify(metricsData, null, 2));
    console.log(`Updated metrics file with upload status`);
    
    return result;
  } catch (error) {
    console.error('Error uploading metrics:', error);
    
    // If metrics file exists, update with error status
    if (fs.existsSync(metricsFilePath)) {
      try {
        const metricsData = JSON.parse(fs.readFileSync(metricsFilePath, 'utf-8'));
        
        metricsData.uploadStatus = {
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message,
          endpoint: METRICS_ENDPOINT,
        };
        
        fs.writeFileSync(metricsFilePath, JSON.stringify(metricsData, null, 2));
        console.log(`Updated metrics file with error status`);
      } catch (fileError) {
        console.error('Error updating metrics file:', fileError);
      }
    }
    
    throw error;
  }
}

// Generate visualization data for metrics dashboard
async function generateVisualizationData() {
  console.log('Generating visualization data...');
  
  try {
    // Read metrics from file
    const metricsData = JSON.parse(fs.readFileSync(metricsFilePath, 'utf-8'));
    
    // Get historical metrics files (last 30 days)
    const metricFiles = fs.readdirSync(metricsDir)
      .filter(file => file.startsWith('metrics-') && file.endsWith('.json'))
      .sort()
      .slice(-30);
    
    // Read historical data
    const historicalData = metricFiles.map(file => {
      const filePath = path.join(metricsDir, file);
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    });
    
    // Generate time series data for key metrics
    const timeSeriesData = {
      dates: historicalData.map(data => data.date),
      users: {
        total: historicalData.map(data => data.users.total),
        active: historicalData.map(data => data.users.active),
        new: historicalData.map(data => data.users.new),
      },
      agents: {
        total: historicalData.map(data => data.agents.total),
        verified: historicalData.map(data => data.agents.verified),
      },
      messages: {
        total: historicalData.map(data => data.messages.recent),
        priority: historicalData.map(data => data.messages.priority.recent),
        responseTime: historicalData.map(data => data.messages.avgResponseTimeSeconds),
      },
      webhooks: {
        successRate: historicalData.map(data => data.webhooks.deliveries.successRate),
      },
    };
    
    // Save visualization data
    const visualizationFilePath = path.join(metricsDir, `visualization-${dateString}.json`);
    fs.writeFileSync(visualizationFilePath, JSON.stringify(timeSeriesData, null, 2));
    
    console.log(`Visualization data saved to ${visualizationFilePath}`);
    return timeSeriesData;
  } catch (error) {
    console.error('Error generating visualization data:', error);
    throw error;
  }
}

// Run the metrics upload if the script is executed directly
if (require.main === module) {
  // Check for API key
  if (!METRICS_API_KEY) {
    console.error('Error: METRICS_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  // Upload metrics and generate visualization data
  Promise.all([
    uploadMetrics(),
    generateVisualizationData()
  ])
    .then(() => {
      console.log('Metrics upload and visualization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error in metrics upload or visualization:', error);
      process.exit(1);
    });
}

module.exports = {
  uploadMetrics,
  generateVisualizationData,
};