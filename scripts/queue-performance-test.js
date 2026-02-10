/**
 * Message Queue Performance Testing Script
 * 
 * This script tests the performance of the GlassWall message queue system
 * under various loads and scenarios.
 */

const { performance } = require('perf_hooks');
const { MessageQueueService } = require('../src/services/MessageQueueService');

// Configuration options
const TEST_DURATION_SECONDS = 60;
const QUEUES = ['general', 'priority', 'admin'];
const MESSAGE_SIZES = {
  small: 100, // bytes
  medium: 1000, // bytes
  large: 10000, // bytes
};
const MAX_MESSAGES_PER_SECOND = {
  general: 1000,
  priority: 500,
  admin: 100,
};

// Test scenarios
const SCENARIOS = [
  {
    name: 'Normal Load',
    messageRate: 0.3, // 30% of max capacity
    distribution: { general: 0.7, priority: 0.2, admin: 0.1 },
    messageSize: 'medium',
  },
  {
    name: 'High Load',
    messageRate: 0.7, // 70% of max capacity
    distribution: { general: 0.6, priority: 0.3, admin: 0.1 },
    messageSize: 'medium',
  },
  {
    name: 'Peak Load',
    messageRate: 1.0, // 100% of max capacity
    distribution: { general: 0.5, priority: 0.4, admin: 0.1 },
    messageSize: 'medium',
  },
  {
    name: 'Stress Test',
    messageRate: 1.2, // 120% of max capacity
    distribution: { general: 0.5, priority: 0.4, admin: 0.1 },
    messageSize: 'medium',
  },
  {
    name: 'Large Message Test',
    messageRate: 0.5, // 50% of max capacity
    distribution: { general: 0.7, priority: 0.2, admin: 0.1 },
    messageSize: 'large',
  },
];

// Helper functions
function generateRandomMessage(size) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < size; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    content: result,
    timestamp: new Date().toISOString(),
  };
}

async function runScenario(scenario, queueService) {
  console.log(`\nRunning scenario: ${scenario.name}`);
  console.log('======================================');
  
  const results = {
    scenario: scenario.name,
    totalMessages: 0,
    messagesPerQueue: {},
    enqueueTimes: [],
    dequeueTimes: [],
    processingTimes: [],
    errors: 0,
    throughput: 0,
  };
  
  // Initialize stats for each queue
  QUEUES.forEach(queue => {
    results.messagesPerQueue[queue] = 0;
  });
  
  // Calculate message rates per queue
  const messagesPerSecond = {};
  QUEUES.forEach(queue => {
    messagesPerSecond[queue] = Math.floor(
      MAX_MESSAGES_PER_SECOND[queue] * 
      scenario.messageRate * 
      scenario.distribution[queue]
    );
    console.log(`Queue '${queue}': ${messagesPerSecond[queue]} messages/second`);
  });
  
  // Track queued messages to process them later
  const queuedMessages = {
    general: [],
    priority: [],
    admin: [],
  };
  
  // Start time
  const startTime = performance.now();
  const endTime = startTime + (TEST_DURATION_SECONDS * 1000);
  
  // Producer function - enqueues messages at the specified rate
  async function producer() {
    let currentTime = performance.now();
    
    while (currentTime < endTime) {
      const loopStart = performance.now();
      
      // Enqueue messages for each queue at their calculated rate
      for (const queue of QUEUES) {
        const messagesToEnqueue = messagesPerSecond[queue];
        
        for (let i = 0; i < messagesToEnqueue; i++) {
          try {
            const message = generateRandomMessage(MESSAGE_SIZES[scenario.messageSize]);
            const enqueueStart = performance.now();
            await queueService.enqueue(queue, message);
            const enqueueEnd = performance.now();
            
            results.enqueueTimes.push(enqueueEnd - enqueueStart);
            results.totalMessages++;
            results.messagesPerQueue[queue]++;
            
            queuedMessages[queue].push({
              message,
              enqueueTime: enqueueStart,
            });
          } catch (error) {
            results.errors++;
            console.error(`Error enqueueing to ${queue}:`, error.message);
          }
        }
      }
      
      // Wait until the next second
      const loopEnd = performance.now();
      const loopDuration = loopEnd - loopStart;
      if (loopDuration < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - loopDuration));
      }
      
      currentTime = performance.now();
    }
  }
  
  // Consumer function - processes messages from queues
  async function consumer() {
    let currentTime = performance.now();
    
    while (currentTime < endTime || Object.values(queuedMessages).some(q => q.length > 0)) {
      // Process messages from each queue
      for (const queue of QUEUES) {
        const queued = queuedMessages[queue];
        
        if (queued.length > 0) {
          try {
            const { message, enqueueTime } = queued.shift();
            const dequeueStart = performance.now();
            await queueService.dequeue(queue);
            const dequeueEnd = performance.now();
            
            results.dequeueTimes.push(dequeueEnd - dequeueStart);
            results.processingTimes.push(dequeueEnd - enqueueTime);
          } catch (error) {
            results.errors++;
            console.error(`Error processing from ${queue}:`, error.message);
          }
        }
      }
      
      // Small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      currentTime = performance.now();
    }
  }
  
  // Run producer and consumer concurrently
  console.log(`Starting test (${TEST_DURATION_SECONDS} seconds)...`);
  await Promise.all([
    producer(),
    consumer(),
  ]);
  
  // Calculate results
  const testDuration = (performance.now() - startTime) / 1000; // in seconds
  results.throughput = results.totalMessages / testDuration;
  
  // Calculate averages
  const calculateAverage = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const enqueueMean = calculateAverage(results.enqueueTimes);
  const dequeueMean = calculateAverage(results.dequeueTimes);
  const processingMean = calculateAverage(results.processingTimes);
  
  // Report results
  console.log('\nTest Results:');
  console.log('======================================');
  console.log(`Duration: ${testDuration.toFixed(2)}s`);
  console.log(`Total Messages: ${results.totalMessages}`);
  console.log(`Throughput: ${results.throughput.toFixed(2)} messages/second`);
  console.log(`Errors: ${results.errors}`);
  console.log('\nTime Metrics (ms):');
  console.log(`Enqueue Avg: ${enqueueMean.toFixed(2)}`);
  console.log(`Dequeue Avg: ${dequeueMean.toFixed(2)}`);
  console.log(`Processing Avg: ${processingMean.toFixed(2)}`);
  console.log('\nQueue Distribution:');

  for (const queue of QUEUES) {
    console.log(`${queue}: ${results.messagesPerQueue[queue]} messages`);
  }
  
  return results;
}

// Main test function
async function runTests() {
  console.log('MESSAGE QUEUE PERFORMANCE TESTING');
  console.log('=================================');
  console.log(`Starting tests with ${SCENARIOS.length} scenarios`);
  
  const queueService = new MessageQueueService({
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    maxRetries: 3,
  });
  
  const allResults = [];
  
  try {
    // Initialize queue service
    await queueService.initialize();
    
    // Run each scenario
    for (const scenario of SCENARIOS) {
      const results = await runScenario(scenario, queueService);
      allResults.push(results);
    }
    
    // Generate summary
    console.log('\nTEST SUMMARY');
    console.log('=================================');
    console.log('Scenarios:\n');
    
    allResults.forEach(result => {
      console.log(`${result.scenario}:`);
      console.log(`  Throughput: ${result.throughput.toFixed(2)} msg/s`);
      console.log(`  Errors: ${result.errors}`);
      const processingAvg = calculateAverage(result.processingTimes);
      console.log(`  Avg Processing Time: ${processingAvg.toFixed(2)} ms`);
      console.log('');
    });
    
    // Save results to file
    const fs = require('fs');
    const resultsFilePath = './performance-results.json';
    fs.writeFileSync(
      resultsFilePath, 
      JSON.stringify({ 
        timestamp: new Date().toISOString(),
        results: allResults 
      }, null, 2)
    );
    
    console
    .log(`Results saved to ${resultsFilePath}`);
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Cleanup
    await queueService.shutdown();
    console.log('\nTests completed');
  }
}

// Helper function for calculating averages
function calculateAverage(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// Entry point
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  runScenario,
};