# GitHub Actions Workflows for GlassWall

## Vercel Deployment Workflows

This directory contains GitHub Actions workflows for automatically deploying the GlassWall application to Vercel.

### Setup Instructions

#### Required Secrets

To use these workflows, you need to add the following secrets to your GitHub repository:

1. **VERCEL_TOKEN**
   - A Vercel personal access token
   - Can be created at: https://vercel.com/account/tokens

2. **VERCEL_ORG_ID**
   - Your Vercel organization ID
   - Find it in your Vercel dashboard under Settings → General → Organization ID

3. **VERCEL_PROJECT_ID**
   - Your Vercel project ID for GlassWall
   - Find it in your Vercel project settings under Settings → General → Project ID

#### How to Add Secrets

1. Go to your GitHub repository
2. Click on "Settings"
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each of the secrets listed above

### Workflows

1. **Vercel Production Deployment** (`vercel-deployment.yml`)
   - Triggered on pushes to the main branch
   - Deploys the application to Vercel production environment

2. **Vercel Preview Deployment** (`vercel-preview.yml`)
   - Triggered on pull requests to the main branch
   - Deploys a preview version for testing
   - Adds a comment to the PR with the preview URL

### Automatic Public Directory Creation

Both workflows include a step that checks for the existence of the `public` directory and creates it if missing. This prevents the "Output Directory 'public' is empty" error that was previously encountered.

### Manual Triggering

Both workflows can be manually triggered using the "workflow_dispatch" event through the GitHub Actions UI.