#!/usr/bin/env node

/**
 * Message Queue Performance Test Runner
 * 
 * This script runs the queue performance tests and generates visualizations
 * of the results.
 */

const { runTests } = require('./queue-performance-test');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const RESULTS_DIR = path.join(__dirname, '../test-results');
const CHART_SCRIPT = path.join(__dirname, './generate-performance-charts.js');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Generate timestamp for this test run
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const resultsFile = path.join(RESULTS_DIR, `queue-perf-${timestamp}.json`);

/**
 * Main function
 */
async function main() {
  console.log('MESSAGE QUEUE PERFORMANCE TEST RUNNER');
  console.log('=====================================');
  console.log(`Results will be saved to: ${resultsFile}`);
  
  try {
    // Run the performance tests
    console.log('\nRunning performance tests...');
    const results = await runTests();
    
    // Save results to file
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${resultsFile}`);
    
    // Generate charts if available
    if (fs.existsSync(CHART_SCRIPT)) {
      console.log('\nGenerating performance charts...');
      exec(`node ${CHART_SCRIPT} ${resultsFile}`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error generating charts:', error);
          return;
        }
        
        console.log(stdout);
        if (stderr) {
          console.error(stderr);
        }
      });
    } else {
      console.log('\nSkipping chart generation (chart script not found)');
    }
    
    // Print summary
    console.log('\nTest Completed Successfully');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Execute the main function
if (require.main === module) {
  main().catch(console.error);
}