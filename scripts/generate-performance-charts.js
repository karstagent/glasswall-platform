#!/usr/bin/env node

/**
 * Generate Performance Charts
 * 
 * This script generates performance charts for message queue tests
 * using the results from queue-performance-test.js
 */

const fs = require('fs');
const path = require('path');

// Check if a results file was provided
if (process.argv.length < 3) {
  console.error('Error: No results file specified.');
  console.error('Usage: node generate-performance-charts.js <results-file.json>');
  process.exit(1);
}

const resultsFile = process.argv[2];

// Check if the file exists
if (!fs.existsSync(resultsFile)) {
  console.error(`Error: Results file not found: ${resultsFile}`);
  process.exit(1);
}

// Load the results
let results;
try {
  const data = fs.readFileSync(resultsFile, 'utf8');
  results = JSON.parse(data);
} catch (error) {
  console.error(`Error parsing results file: ${error.message}`);
  process.exit(1);
}

// Create the output directory
const outputDir = path.join(path.dirname(resultsFile), 'charts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate HTML report with charts
const timestamp = new Date().toISOString();
const htmlFile = path.join(outputDir, `perf-report-${path.basename(resultsFile, '.json')}.html`);

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Message Queue Performance Report</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1, h2 {
      color: #333;
    }
    .chart-container {
      position: relative;
      height: 300px;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .summary-card {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Message Queue Performance Report</h1>
    <p>Generated on: ${timestamp}</p>
    
    <div class="summary-card">
      <h2>Summary</h2>
      <p>Total scenarios: ${results.results.length}</p>
      <p>Test duration: ${results.results[0] ? (results.results[0].totalMessages / results.results[0].throughput).toFixed(2) : 'N/A'} seconds</p>
      <p>Total messages processed: ${results.results.reduce((sum, r) => sum + r.totalMessages, 0)}</p>
    </div>
    
    <h2>Throughput Comparison</h2>
    <div class="chart-container">
      <canvas id="throughputChart"></canvas>
    </div>
    
    <h2>Processing Time Comparison</h2>
    <div class="chart-container">
      <canvas id="processingTimeChart"></canvas>
    </div>
    
    <h2>Errors Comparison</h2>
    <div class="chart-container">
      <canvas id="errorsChart"></canvas>
    </div>
    
    <h2>Detailed Results</h2>
    <table>
      <thead>
        <tr>
          <th>Scenario</th>
          <th>Throughput (msg/s)</th>
          <th>Errors</th>
          <th>Avg. Processing Time (ms)</th>
          <th>Messages Processed</th>
        </tr>
      </thead>
      <tbody>
        ${results.results.map(r => `
        <tr>
          <td>${r.scenario}</td>
          <td>${r.throughput.toFixed(2)}</td>
          <td>${r.errors}</td>
          <td>${(r.processingTimes.reduce((a, b) => a + b, 0) / r.processingTimes.length).toFixed(2)}</td>
          <td>${r.totalMessages}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <script>
    // Data from test results
    const scenarios = ${JSON.stringify(results.results.map(r => r.scenario))};
    const throughputs = ${JSON.stringify(results.results.map(r => parseFloat(r.throughput.toFixed(2))))};
    const errors = ${JSON.stringify(results.results.map(r => r.errors))};
    const processingTimes = ${JSON.stringify(results.results.map(r => 
      parseFloat((r.processingTimes.reduce((a, b) => a + b, 0) / r.processingTimes.length).toFixed(2))
    ))};
    
    // Throughput chart
    const ctxThroughput = document.getElementById('throughputChart').getContext('2d');
    new Chart(ctxThroughput, {
      type: 'bar',
      data: {
        labels: scenarios,
        datasets: [{
          label: 'Throughput (messages/second)',
          data: throughputs,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Messages per Second'
            }
          }
        }
      }
    });
    
    // Processing Time chart
    const ctxProcessingTime = document.getElementById('processingTimeChart').getContext('2d');
    new Chart(ctxProcessingTime, {
      type: 'bar',
      data: {
        labels: scenarios,
        datasets: [{
          label: 'Avg. Processing Time (ms)',
          data: processingTimes,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Milliseconds'
            }
          }
        }
      }
    });
    
    // Errors chart
    const ctxErrors = document.getElementById('errorsChart').getContext('2d');
    new Chart(ctxErrors, {
      type: 'bar',
      data: {
        labels: scenarios,
        datasets: [{
          label: 'Errors',
          data: errors,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Error Count'
            }
          }
        }
      }
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(htmlFile, htmlContent);
console.log(`Generated HTML report: ${htmlFile}`);

// Create a summary text file
const summaryFile = path.join(outputDir, `perf-summary-${path.basename(resultsFile, '.json')}.txt`);
const summaryContent = `MESSAGE QUEUE PERFORMANCE SUMMARY
================================
Generated: ${timestamp}

SCENARIOS:
${results.results.map(r => `
${r.scenario}:
  - Throughput: ${r.throughput.toFixed(2)} messages/second
  - Errors: ${r.errors}
  - Avg Processing Time: ${(r.processingTimes.reduce((a, b) => a + b, 0) / r.processingTimes.length).toFixed(2)} ms
  - Messages Processed: ${r.totalMessages}
`).join('')}

OVERALL:
- Total Scenarios: ${results.results.length}
- Total Messages: ${results.results.reduce((sum, r) => sum + r.totalMessages, 0)}
- Avg Throughput: ${(results.results.reduce((sum, r) => sum + r.throughput, 0) / results.results.length).toFixed(2)} messages/second
- Total Errors: ${results.results.reduce((sum, r) => sum + r.errors, 0)}
`;

fs.writeFileSync(summaryFile, summaryContent);
console.log(`Generated summary: ${summaryFile}`);

console.log('Chart generation completed successfully.');