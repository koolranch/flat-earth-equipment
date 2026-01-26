#!/bin/bash

# FEE SEO Monitoring Setup Script
# This script helps set up automated monitoring for SEO performance

echo "🚀 Setting up FEE SEO monitoring..."

# Create necessary directories
mkdir -p reports/dashboard
mkdir -p reports/templates
mkdir -p logs

# Set up log rotation for monitoring
cat > logs/monitoring.log << EOL
# SEO Monitoring Log
# Started: $(date)
EOL

# Create cron job for daily monitoring (commented out - manual setup)
echo "📅 To set up daily monitoring, add this to your crontab:"
echo "# Daily SEO monitoring at 9 AM"
echo "0 9 * * * cd /path/to/fee-website && node scripts/google-search-console-monitor.js >> logs/monitoring.log 2>&1"
echo ""
echo "# Weekly report generation on Mondays at 10 AM"  
echo "0 10 * * 1 cd /path/to/fee-website && node scripts/performance-dashboard.js >> logs/monitoring.log 2>&1"

echo ""
echo "📧 Email alert setup:"
echo "1. Configure SMTP settings in your environment"
echo "2. Set EMAIL_ALERTS_TO in your .env file"
echo "3. Test with: node scripts/test-email-alerts.js"

echo ""
echo "📱 Slack integration setup:"
echo "1. Create a Slack webhook URL"
echo "2. Set SLACK_WEBHOOK_URL in your .env file"
echo "3. Test with: node scripts/test-slack-alerts.js"

echo ""
echo "🔐 Google Search Console API setup:"
echo "1. Enable Search Console API in Google Cloud Console"
echo "2. Create service account credentials"
echo "3. Add credentials to your .env file as GSC_SERVICE_ACCOUNT_KEY"
echo "4. Grant service account access to your Search Console property"

echo ""
echo "✅ Monitoring framework is ready!"
echo "📊 View dashboard: open reports/dashboard/index.html"
echo "📋 Check reports in: reports/ directory"

