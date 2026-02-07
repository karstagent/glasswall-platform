#!/bin/bash

# GlassWall Deployment Script
# This script deploys the GlassWall platform to Vercel

# Exit on error
set -e

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERCEL_PROJECT_NAME="glasswall-app"
ENV_FILE="${PROJECT_DIR}/.env.production"

# Print header
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}GlassWall Deployment Script${NC}"
echo -e "${BLUE}============================================${NC}"
echo

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}Error: Vercel CLI is not installed${NC}"
  echo -e "${YELLOW}Please install Vercel CLI: npm install -g vercel${NC}"
  exit 1
fi

# Check if user is logged into Vercel
VERCEL_USER=$(vercel whoami 2>/dev/null || echo "")
if [ -z "$VERCEL_USER" ]; then
  echo -e "${YELLOW}You are not logged into Vercel. Please log in:${NC}"
  vercel login
fi

# Check for deployment environment
if [ -z "$1" ]; then
  echo -e "${YELLOW}No deployment environment specified. Using 'production'${NC}"
  DEPLOY_ENV="production"
else
  DEPLOY_ENV="$1"
fi

# Verify environment
echo -e "${BLUE}Deployment environment: ${DEPLOY_ENV}${NC}"
if [ "$DEPLOY_ENV" != "production" ] && [ "$DEPLOY_ENV" != "preview" ] && [ "$DEPLOY_ENV" != "development" ]; then
  echo -e "${RED}Error: Invalid deployment environment. Use 'production', 'preview', or 'development'${NC}"
  exit 1
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}Warning: ${ENV_FILE} not found${NC}"
  echo -e "${YELLOW}Creating sample .env.production file...${NC}"
  
  cat > "$ENV_FILE" <<EOL
# GlassWall Environment Variables
NEXTAUTH_URL=https://glasswall-app.vercel.app
NEXTAUTH_SECRET=generate-a-secure-secret

# OAuth Providers
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=postgresql://user:password@host:port/dbname

# Redis
REDIS_URL=redis://user:password@host:port

# Webhooks
WEBHOOK_SIGNING_SECRET=generate-a-secure-secret
EOL
  
  echo -e "${YELLOW}Please edit ${ENV_FILE} with your actual values before deploying${NC}"
  echo -e "${YELLOW}Press Enter to continue or Ctrl+C to abort...${NC}"
  read
fi

# Build the project
echo
echo -e "${BLUE}Building project...${NC}"
cd "$PROJECT_DIR"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Run linting and type checking
echo -e "${YELLOW}Running linting and type checking...${NC}"
npm run lint
npm run typecheck

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm test || {
  echo -e "${RED}Tests failed. Do you want to continue with deployment? (y/n)${NC}"
  read -r answer
  if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
    echo -e "${RED}Deployment aborted${NC}"
    exit 1
  fi
}

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build

# Deploy to Vercel
echo
echo -e "${BLUE}Deploying to Vercel (${DEPLOY_ENV})...${NC}"

if [ "$DEPLOY_ENV" = "production" ]; then
  echo -e "${RED}WARNING: You are about to deploy to PRODUCTION${NC}"
  echo -e "${RED}This will affect the live site at https://glasswall-app.vercel.app${NC}"
  echo -e "${YELLOW}Are you sure you want to continue? (y/n)${NC}"
  read -r answer
  if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
    echo -e "${RED}Deployment aborted${NC}"
    exit 1
  fi
fi

# Deploy with Vercel CLI
DEPLOY_ARGS="--prod"
if [ "$DEPLOY_ENV" = "preview" ]; then
  DEPLOY_ARGS=""
fi

if [ "$DEPLOY_ENV" = "development" ]; then
  DEPLOY_ARGS="--dev"
fi

vercel deploy ${DEPLOY_ARGS} --yes

# Success message
echo
echo -e "${GREEN}Deployment completed successfully!${NC}"
if [ "$DEPLOY_ENV" = "production" ]; then
  echo -e "${GREEN}Your application is now live at:${NC}"
  echo -e "${GREEN}https://glasswall-app.vercel.app${NC}"
else
  echo -e "${GREEN}Your preview deployment is now available${NC}"
fi

# Database migrations reminder
echo
echo -e "${YELLOW}Important:${NC}"
echo -e "${YELLOW}Remember to run database migrations if you've made schema changes${NC}"
echo -e "${YELLOW}You can use the following command to apply migrations:${NC}"
echo -e "${YELLOW}  vercel env pull .env.vercel${NC}"
echo -e "${YELLOW}  DATABASE_URL=\$(grep DATABASE_URL .env.vercel | cut -d '=' -f2-)${NC}"
echo -e "${YELLOW}  psql \$DATABASE_URL -f deployment/database-schema.sql${NC}"

echo
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Deployment Complete${NC}"
echo -e "${BLUE}============================================${NC}"