# 🚀 Deployment Guide for GitHub Pages

This guide will help you deploy your Study Game app to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. Your project pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Initialize Git Repository (if not already done)

```bash
cd /Users/juliusgrimm/Desktop/GitHub/study-app
git init
git add .
git commit -m "Initial commit: Study Game app with PDF processing and gamification"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right
3. Select "New repository"
4. Name it: `study-app`
5. Don't initialize with README (you already have one)
6. Click "Create repository"

### 3. Connect Local Repository to GitHub

```bash
git remote add origin https://github.com/JustThatRandomCoder/study-app.git
git branch -M main
git push -u origin main
```

### 4. Install GitHub Pages Package

The package is already in your `package.json`, but if you need to install it manually:

```bash
npm install --save-dev gh-pages
```

### 5. Verify package.json Configuration

Your `package.json` should already have:

```json
{
  "homepage": "https://JustThatRandomCoder.github.io/study-app",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### 6. Deploy to GitHub Pages

```bash
npm run deploy
```

This command will:

1. Build your app for production
2. Create a `gh-pages` branch
3. Push the build to that branch
4. Deploy to GitHub Pages

### 7. Configure GitHub Pages Settings

1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll to "Pages" in the left sidebar
4. Under "Source", select `gh-pages` branch
5. Click "Save"

### 8. Access Your App

Your app will be live at:

```
https://JustThatRandomCoder.github.io/study-app
```

It may take a few minutes for the site to be available after the first deployment.

## Updating Your Deployed App

Whenever you make changes and want to update the live site:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main

# Deploy the updated version
npm run deploy
```

## Troubleshooting

### Issue: Blank Page After Deployment

**Solution**: Make sure the `homepage` field in `package.json` matches your GitHub Pages URL exactly.

### Issue: 404 Error on Page Refresh

**Solution**: This is expected with client-side routing on GitHub Pages. The app uses React Router's `basename` prop which is already configured.

### Issue: CSS or Assets Not Loading

**Solution**: Verify that all asset paths are relative and the `basename` in `App.js` matches your repository name.

### Issue: Build Fails

**Solution**:

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Try `npm run build` again

## Testing Locally Before Deployment

Always test your production build locally before deploying:

```bash
npm run build
npx serve -s build -l 3000
```

Open `http://localhost:3000` to test the production build.

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file to the `public` folder with your domain
2. Configure your domain's DNS settings
3. Follow [GitHub's custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## Performance Tips

- The app is optimized for production
- All assets are minified and bundled
- Images and fonts are optimized
- Lazy loading is implemented where possible

## Security Notes

- All data is stored locally in the browser
- No backend or database required
- PDFs are processed client-side only
- No user data is transmitted to any server

## Monitoring

After deployment, you can:

- Check GitHub Actions for deployment logs
- Use browser DevTools to check for console errors
- Monitor GitHub repository insights for traffic

## Need Help?

If you encounter issues:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review the error messages in the terminal
3. Check the browser console for errors
4. Ensure all dependencies are installed correctly

---

Happy deploying! 🎉
