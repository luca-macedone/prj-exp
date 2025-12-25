#!/bin/bash
echo "🔄 Restarting app with clean cache..."
cd personal-finance-app

# Stop any running Metro bundler
echo "📱 Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

# Clear caches
echo "🧹 Clearing caches..."
rm -rf .expo
rm -rf node_modules/.cache

# Clear React Native cache
npx react-native start --reset-cache &

echo ""
echo "✅ Metro bundler restarted with clean cache"
echo ""
echo "📱 Now restart your app (shake device > Reload)"
echo "   or run: npx expo start -c"
