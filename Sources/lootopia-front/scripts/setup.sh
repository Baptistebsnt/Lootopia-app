#!/bin/bash

# Lootopia Setup Script
echo "🏴‍☠️ Lootopia Setup Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    print_status "Setting up environment file..."
    if [ ! -f .env ]; then
        cat > .env << EOF
# Lootopia Environment Configuration
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Lootopia
VITE_APP_VERSION=1.0.0

# Development settings
NODE_ENV=development
PORT=3001

# Database settings
DB_PATH=./data/lootopia.db

# JWT settings
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server settings
CORS_ORIGIN=http://localhost:5173
EOF
        print_success "Environment file created"
    else
        print_warning "Environment file already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p data
    mkdir -p logs
    mkdir -p docs
    print_success "Directories created"
}

# Setup mobile development
setup_mobile() {
    print_status "Setting up mobile development environment..."
    
    # Check if Capacitor is installed
    if npm list @capacitor/cli &> /dev/null; then
        print_success "Capacitor is already installed"
    else
        print_status "Installing Capacitor..."
        npm install @capacitor/cli
    fi
    
    # Make mobile-dev.sh executable
    if [ -f mobile-dev.sh ]; then
        chmod +x mobile-dev.sh
        print_success "Mobile development script is executable"
    fi
}

# Check development tools
check_dev_tools() {
    print_status "Checking development tools..."
    
    # Check Xcode (macOS only)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v xcodebuild &> /dev/null; then
            print_success "Xcode found"
        else
            print_warning "Xcode not found. iOS development will not be available."
        fi
    fi
    
    # Check Android Studio
    if command -v adb &> /dev/null; then
        print_success "Android SDK found"
    else
        print_warning "Android SDK not found. Android development will not be available."
    fi
}

# Build the project
build_project() {
    print_status "Building the project..."
    if npm run build; then
        print_success "Project built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Sync with mobile platforms
sync_mobile() {
    print_status "Syncing with mobile platforms..."
    if npx cap sync; then
        print_success "Mobile platforms synced"
    else
        print_warning "Mobile sync failed (this is normal if mobile tools are not installed)"
    fi
}

# Main setup function
main() {
    echo "Starting Lootopia setup..."
    echo ""
    
    check_node
    check_npm
    install_dependencies
    setup_env
    create_directories
    setup_mobile
    check_dev_tools
    build_project
    sync_mobile
    
    echo ""
    print_success "🎉 Lootopia setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start the backend server: npm run server"
    echo "2. Start the frontend: npm run dev"
    echo "3. For mobile development: ./mobile-dev.sh ios"
    echo ""
    echo "Documentation:"
    echo "- Main README: README.md"
    echo "- Mobile guide: docs/MOBILE_README.md"
    echo "- API docs: docs/API.md"
    echo ""
    print_success "Happy treasure hunting! 🏴‍☠️"
}

# Run main function
main 