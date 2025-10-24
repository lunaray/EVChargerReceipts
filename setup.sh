#!/bin/bash

# EV Charging Tracker - Development Setup Script

echo "🚀 Starting EV Charging Tracker Development Environment"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. In one terminal, run: npm run dev:server"
echo "2. In another terminal, run: npm start"
echo ""
echo "Or use the combined command: npm run dev"