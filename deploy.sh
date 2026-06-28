#!/bin/bash
# Deploy Kronos X402 to Railway

echo "🚀 Kronos X402 Deployment"
echo "=========================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "Logging into Railway..."
railway login

# Initialize project
echo "Initializing Railway project..."
railway init --name kronos-x402

# Set environment variables
railway variables set \
    WALLET_ADDRESS=0x7457c38Ee6306d698C94B23914724F74C8E6e0DB \
    WALLET_PRIVATE_KEY=$WALLET_PRIVATE_KEY \
    PRICE_PREFLIGHT=0.03 \
    PRICE_DECISION=0.10 \
    PRICE_AUDIT=0.05

# Deploy
echo "Deploying to Railway..."
railway up

echo "✅ Done! Your server is live."
