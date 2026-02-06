// Script to deploy the application to Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Deploying to Vercel...');

try {
  // Build the application
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Deploy to Vercel
  console.log('Deploying to Vercel...');
  execSync('npx vercel deploy --prod', { stdio: 'inherit' });
  
  console.log('Deployment completed successfully!');
} catch (error) {
  console.error('Error deploying to Vercel:', error.message);
  process.exit(1);
}