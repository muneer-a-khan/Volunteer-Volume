#!/bin/bash

# Volunteer Management System Deployment Script
# This script automates the deployment process for the Volunteer Management System

# Exit on error
set -e

# Configuration
DEPLOY_ENV=${1:-production}
COMMIT_HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y%m%d%H%M%S)
DEPLOY_TAG="$DEPLOY_ENV-$COMMIT_HASH-$TIMESTAMP"

echo "🚀 Starting deployment process for $DEPLOY_ENV environment"
echo "📋 Deployment tag: $DEPLOY_TAG"

# 1. Validate environment
echo "🔍 Validating environment..."
if [ "$DEPLOY_ENV" != "production" ] && [ "$DEPLOY_ENV" != "staging" ]; then
  echo "❌ Invalid environment. Use 'production' or 'staging'"
  exit 1
fi

# Load appropriate environment variables
if [ -f ".env.$DEPLOY_ENV" ]; then
  echo "✅ Loading $DEPLOY_ENV environment variables"
  source ".env.$DEPLOY_ENV"
else
  echo "❌ Environment file .env.$DEPLOY_ENV not found"
  exit 1
fi

# 2. Run tests
echo "🧪 Running tests..."
npm run test

# Check if tests passed
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Aborting deployment."
  exit 1
fi

echo "✅ Tests passed"

# 3. Build application
echo "🏗️ Building application for $DEPLOY_ENV..."
if [ "$DEPLOY_ENV" == "production" ]; then
  npm run build
else
  npm run build:staging
fi

# Check if build succeeded
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting deployment."
  exit 1
fi

echo "✅ Build completed successfully"

# 4. Create deployment package
echo "📦 Creating deployment package..."
DEPLOY_DIR="deploy-$DEPLOY_TAG"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files to deployment directory
cp -r .next "$DEPLOY_DIR/"
cp -r public "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp next.config.js "$DEPLOY_DIR/"
cp -r .env* "$DEPLOY_DIR/"

# Create deployment info file
echo "Deployment: $DEPLOY_TAG" > "$DEPLOY_DIR/deploy-info.txt"
echo "Date: $(date)" >> "$DEPLOY_DIR/deploy-info.txt"
echo "Commit: $COMMIT_HASH" >> "$DEPLOY_DIR/deploy-info.txt"

# Create deployment archive
tar -czf "$DEPLOY_DIR.tar.gz" "$DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"

echo "✅ Deployment package created: $DEPLOY_DIR.tar.gz"

# 5. Deploy to server
echo "🚀 Deploying to $DEPLOY_ENV server..."
# This section would contain the commands to upload and deploy to your server
# Examples:
# - scp for secure file transfer
# - ssh commands to stop service, extract files, and restart
# - or invoking cloud deployment services

# For example (uncomment and customize as needed):
# scp "$DEPLOY_DIR.tar.gz" user@your-server:/path/to/deployments/
# ssh user@your-server "cd /path/to/deployments && \
#   tar -xzf $DEPLOY_DIR.tar.gz && \
#   pm2 stop volunteer-system && \
#   rm -rf current && \
#   mv $DEPLOY_DIR current && \
#   cd current && \
#   npm ci --production && \
#   pm2 start ecosystem.config.js --env $DEPLOY_ENV"

echo "✅ Deployment commands would go here - add your specific deployment commands"

# 6. Post-deployment verification
echo "🔍 Verifying deployment..."
# Commands to verify deployment, such as health checks
# For example:
# HEALTH_CHECK=$(curl -s https://your-site.com/api/health)
# if [[ $HEALTH_CHECK != *"ok"* ]]; then
#   echo "❌ Health check failed. Site may not be running correctly."
# else
#   echo "✅ Health check passed. Site is running correctly."
# fi

echo "✅ Verification steps would go here - add your specific verification commands"

# 7. Clean up
echo "🧹 Cleaning up..."
# Uncomment to remove the deployment package:
# rm "$DEPLOY_DIR.tar.gz"

echo "✅ Deployment cleanup complete"

echo "✅ Deployment to $DEPLOY_ENV completed successfully!"
echo "🎉 Deployment tag: $DEPLOY_TAG" 