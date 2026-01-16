# Deployment Guide

This guide will help you deploy the SAT Math Bank to various platforms.

## Quick Deploy Options

### 1. Vercel (Easiest - Recommended)

**One-Click Deploy:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"
6. Done! Your site will be live at `your-project.vercel.app`

**CLI Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd sat-math-bank
vercel

# Follow the prompts
# Your site will be live in seconds!
```

### 2. Netlify (Also Easy)

**Drag & Drop:**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `sat-math-bank` folder
3. Drop it on the page
4. Done! Your site is live

**Git Deploy:**
1. Push to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "New site from Git"
4. Connect to your repository
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `.`
6. Click "Deploy site"

### 3. GitHub Pages

1. Push your code to GitHub
2. Go to your repository settings
3. Scroll to "Pages"
4. Source: Select your branch (usually `main`)
5. Folder: Select `/ (root)`
6. Click "Save"
7. Wait a few minutes
8. Your site will be at `username.github.io/repo-name`

**Note for GitHub Pages:** You may need to update paths in your HTML files:
- Change `/data/problems.json` to `./data/problems.json`
- Change `/admin/` to `./admin/`

## Local Testing

Before deploying, test locally:

```bash
# Using Python (recommended)
cd sat-math-bank
python3 -m http.server 8000

# Or using Node.js
npx http-server -p 8000

# Or using PHP
php -S localhost:8000

# Then visit: http://localhost:8000/public/
```

## Custom Domain Setup

### Vercel
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update your DNS records as instructed
5. SSL is automatic!

### Netlify
1. Go to "Domain settings"
2. Click "Add custom domain"
3. Follow DNS instructions
4. SSL is automatic!

### GitHub Pages
1. Add a `CNAME` file to your repo with your domain
2. Update DNS to point to GitHub's servers
3. Enable HTTPS in settings

## Environment Variables

This project doesn't require environment variables currently. If you add a backend later:

**Vercel:**
```bash
vercel env add
```

**Netlify:**
Use the web UI: Site settings → Build & deploy → Environment

## Updating Your Deployment

### Vercel/Netlify (Git-based)
1. Push changes to GitHub
2. Automatic deployment triggered
3. Done!

### Manual Updates
1. Re-deploy using the same method
2. Your changes will go live

## Troubleshooting

### Issue: 404 errors
- Check that all paths are correct
- For GitHub Pages, use relative paths (`./` instead of `/`)

### Issue: localStorage not working
- localStorage works in all modern browsers
- Make sure you're not in incognito/private mode
- Check browser settings

### Issue: Can't access admin panel
- Make sure `/admin/index.html` exists
- Check that paths in links are correct

### Issue: Problems not loading
- Check that `data/problems.json` exists
- Verify JSON is valid (use jsonlint.com)
- Check browser console for errors

## Performance Optimization

### For Large Databases (1000+ problems)
1. Consider pagination in JavaScript
2. Lazy load problem cards
3. Use a real database (Firebase, Supabase)

### Caching
- Static files are cached by default on Vercel/Netlify
- Set cache headers if using custom server

## Security Notes

- This is a static site - no server-side security needed
- localStorage is client-side only
- For user accounts, you'll need a backend (consider Firebase Auth)

## Backup Strategy

**Important:** Always backup your problems database!

1. Use the "Export" button regularly
2. Commit `data/problems.json` to Git
3. Keep local copies of exported JSON files

## Adding a Backend (Optional)

If you want cloud sync and user accounts:

### Option 1: Firebase
```bash
npm install firebase
```
- Add Firebase config
- Use Firestore for database
- Add Firebase Authentication

### Option 2: Supabase
```bash
npm install @supabase/supabase-js
```
- Create Supabase project
- Use PostgreSQL database
- Built-in authentication

### Option 3: Custom API
- Create a Node.js/Express backend
- Deploy to Heroku/Railway/Render
- Connect frontend to API

## Cost Estimates

- **Vercel**: Free tier is generous (100GB bandwidth/month)
- **Netlify**: Free tier includes 100GB bandwidth/month
- **GitHub Pages**: Completely free (1GB storage, 100GB bandwidth/month)

All three are free for most educational projects!

## Support

Need help deploying? Check:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

---

Happy deploying! 🚀