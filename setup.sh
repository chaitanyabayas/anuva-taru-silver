#!/bin/bash

# Anuva Taru Silver Website Setup Script

echo "=== Anuva Taru Silver Website Setup ==="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first:"
    echo "sudo apt update && sudo apt install -y nodejs npm"
    echo ""
    echo "Or visit: https://nodejs.org/en/download/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm --version)
echo "npm version: $NPM_VERSION"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "Dependencies installed successfully!"
    echo ""
    
    # Create necessary directories
    echo "Creating necessary directories..."
    mkdir -p database
    mkdir -p uploads
    
    echo ""
    echo "=== Setup Complete! ==="
    echo ""
    echo "To start the server:"
    echo "  npm start"
    echo ""
    echo "Access the application:"
    echo "  User Frontend: http://localhost:3000"
    echo "  Admin Panel: http://localhost:3000/admin"
    echo ""
    echo "Default admin credentials:"
    echo "  Email: admin@anuvataru.com"
    echo "  Password: admin123"
    echo ""
    echo "Note: Please add jewelry images to public/images/ directory"
    echo "See public/images/README.md for required image list"
    echo ""
else
    echo ""
    echo "Error installing dependencies. Please check your internet connection and try again."
    exit 1
fi
