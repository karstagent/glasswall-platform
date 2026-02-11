#!/bin/bash
echo "Installing dependencies..."
npm install

echo "Cleaning up old build files..."
rm -rf .next

echo "Generating Prisma client..."
npx prisma generate

echo "Building Next.js application..."
npx next build

echo "Build completed!"