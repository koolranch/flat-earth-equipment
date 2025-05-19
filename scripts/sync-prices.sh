#!/bin/bash

# Change to the project directory
cd "$(dirname "$0")/.."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Check required environment variables
if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then
    echo "Error: NEXT_PUBLIC_SITE_URL is not set"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "Error: NEXT_PUBLIC_SUPABASE_URL is not set"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: SUPABASE_SERVICE_ROLE_KEY is not set"
    exit 1
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "Error: STRIPE_SECRET_KEY is not set"
    exit 1
fi

# Run the sync script
echo "Starting price sync at $(date)"
npx ts-node scripts/sync-prices.ts
echo "Finished price sync at $(date)" 