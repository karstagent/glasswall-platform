// Script to set up the database for development
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if prisma directory exists
const prismaDir = path.join(__dirname, '../prisma');
if (!fs.existsSync(prismaDir)) {
  console.error('Prisma directory not found. Make sure you are running this script from the project root.');
  process.exit(1);
}

console.log('Setting up database...');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Create initial migration
  console.log('Creating initial migration...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  
  console.log('Database setup completed successfully!');
} catch (error) {
  console.error('Error setting up database:', error.message);
  process.exit(1);
}