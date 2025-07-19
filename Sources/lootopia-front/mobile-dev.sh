#!/bin/bash

# Lootopia Mobile Development Script
echo "🚀 Lootopia Mobile Development Script"

# Function to build and sync
build_and_sync() {
    echo "📦 Building web app..."
    npm run build
    
    echo "🔄 Syncing with mobile platforms..."
    npx cap sync
    
    echo "✅ Build and sync completed!"
}

# Function to open iOS simulator
open_ios() {
    echo "🍎 Opening iOS Simulator..."
    npx cap open ios
}

# Function to open Android Studio
open_android() {
    echo "🤖 Opening Android Studio..."
    npx cap open android
}

# Function to run on device/simulator
run_ios() {
    echo "📱 Running on iOS Simulator..."
    npx cap run ios
}

run_android() {
    echo "📱 Running on Android..."
    npx cap run android
}

# Function to live reload
live_reload() {
    echo "🔄 Starting live reload..."
    npx cap run ios --livereload --external
}

# Main menu
case "$1" in
    "build")
        build_and_sync
        ;;
    "ios")
        build_and_sync
        open_ios
        ;;
    "android")
        build_and_sync
        open_android
        ;;
    "run-ios")
        build_and_sync
        run_ios
        ;;
    "run-android")
        build_and_sync
        run_android
        ;;
    "live")
        live_reload
        ;;
    "sync")
        npx cap sync
        ;;
    *)
        echo "Usage: $0 {build|ios|android|run-ios|run-android|live|sync}"
        echo ""
        echo "Commands:"
        echo "  build      - Build web app and sync with mobile platforms"
        echo "  ios        - Build, sync and open iOS project"
        echo "  android    - Build, sync and open Android project"
        echo "  run-ios    - Build, sync and run on iOS simulator"
        echo "  run-android- Build, sync and run on Android"
        echo "  live       - Start live reload for iOS"
        echo "  sync       - Sync web assets with mobile platforms"
        exit 1
        ;;
esac 