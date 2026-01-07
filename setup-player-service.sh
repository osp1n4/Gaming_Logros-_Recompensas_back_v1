#!/bin/bash

# Player Service - Quick Setup Script
# Este script instala dependencias y ejecuta tests

echo "🎮 Player Service - Setup Script"
echo "================================="
echo ""

# Navigate to player-service directory
cd backend/player-service

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🧪 Running tests..."
npm test

echo ""
echo "📊 Generating coverage report..."
npm run test:cov

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the service:"
echo "  npm run dev"
echo ""
