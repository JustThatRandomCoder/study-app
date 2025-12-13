#!/bin/bash

# Study Game - Quick Deploy Script
# This script helps you quickly deploy your app to GitHub Pages

echo "🎮 Study Game - GitHub Pages Deployment"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already exists"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    echo "📝 Creating main branch..."
    git checkout -b main
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit
echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update: Study Game app"
fi
git commit -m "$COMMIT_MSG"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "🔗 GitHub remote not configured"
    echo "Please enter your GitHub repository URL:"
    echo "Example: https://github.com/JustThatRandomCoder/study-app.git"
    read -p "Repository URL: " REPO_URL
    
    if [ ! -z "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo "✅ Remote origin added"
    else
        echo "❌ No repository URL provided. Skipping remote push."
        echo "You can add it later with: git remote add origin <URL>"
    fi
else
    echo "✅ Remote origin already configured"
fi

# Push to GitHub
if git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    echo "✅ Pushed to GitHub"
fi

# Deploy to GitHub Pages
echo ""
echo "🌐 Deploying to GitHub Pages..."
npm run deploy

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Your app should be available at:"
echo "https://JustThatRandomCoder.github.io/study-app"
echo ""
echo "Note: It may take a few minutes for the site to be live."
echo "Also make sure to enable GitHub Pages in your repository settings."
echo ""
echo "Happy studying! 📚"
