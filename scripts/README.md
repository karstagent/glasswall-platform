# Message Queue Performance Testing Tools

This directory contains scripts for performance testing and analyzing the GlassWall message queue system.

## Overview

These tools allow you to:

1. Run performance tests on the message queue system under various load scenarios
2. Generate detailed reports and visualizations of the performance results
3. Identify potential bottlenecks and optimization opportunities

## Scripts

### queue-performance-test.js

This is the main performance testing script that simulates different load scenarios on the message queue system.

Features:
- Tests multiple queue types (general, priority, admin)
- Supports various message sizes and rates
- Measures enqueue/dequeue times and throughput
- Simulates real-world load patterns

### run-queue-tests.js

A runner script that executes the performance tests and saves the results.

Usage:
```
node scripts/run-queue-tests.js
```

This will:
1. Run all test scenarios defined in queue-performance-test.js
2. Save the results to a timestamped JSON file in the test-results directory
3. Generate performance charts if the chart generation script is available

### generate-performance-charts.js

Generates visual charts and reports from test results.

Usage:
```
node scripts/generate-performance-charts.js <results-file.json>
```

Output:
- HTML report with interactive charts
- Text summary file

## Test Scenarios

The following scenarios are tested:

1. **Normal Load** - 30% of max capacity, typical distribution
2. **High Load** - 70% of max capacity, increased priority messages
3. **Peak Load** - 100% of max capacity, heavy priority usage
4. **Stress Test** - 120% of max capacity, testing overflow handling
5. **Large Message Test** - 50% capacity with larger message sizes

## Requirements

- Node.js 16+
- Redis server for queue storage
- Chart.js (loaded from CDN for chart visualization)

## Configuration

Edit the constants at the top of `queue-performance-test.js` to adjust:
- Test duration
- Message sizes
- Queue capacity limits
- Scenario parameters

## Example Output

The HTML report includes:
- Throughput comparison chart
- Processing time comparison chart
- Error rate analysis
- Detailed performance metrics table

## Interpreting Results

When analyzing the results, pay attention to:

1. **Throughput Degradation** - At what point does throughput start to decrease?
2. **Error Rate** - How many messages fail to be processed?
3. **Processing Time** - Does it increase significantly under load?
4. **Queue Balance** - Are some queues processing slower than others?

## Optimization Opportunities

Based on the test results, consider:
1. Increasing/decreasing the number of worker threads
2. Adjusting batch sizes for processing
3. Implementing better error handling and retry logic
4. Optimizing database interactions for queue persistence