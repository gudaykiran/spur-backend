# Render Deployment Guide - Backend

Complete guide to deploy the Express backend on Render.

## 🚀 Quick Deployment Steps

### Step 1: Push to GitHub

Your code is already on GitHub at: `https://github.com/gudaykiran/spur-backend`

### Step 2: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Click **"Connect GitHub account"** (if not already connected)
4. Find and select: **`gudaykiran/spur-backend`**
5. Click **"Connect"**

### Step 4: Configure Web Service

Fill in these settings:

**Basic Settings:**
- **Name**: `spur-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: 
  ```
  npm install && npm run build && npx prisma generate
  ```
- **Start Command**: 
  ```
  npm start
  ```

**Instance Type:**
- Select **"Free"** (for testing)
- Or **"Starter"** ($7/month for production)

### Step 5: Add Environment Variables

Click **"Advanced"** → Scroll to **"Environment Variables"**

Add these variables:

1. **DATABASE_URL**
   - Value: `postgresql://username:password@host:port/database`
   - Get from Supabase or create new database (see below)

2. **CLAUDE_API_KEY**
   - Value: `sk-ant-xxxxx` (your Anthropic API key)

3. **NODE_ENV**
   - Value: `production`

4. **PORT** (optional, Render sets this automatically)
   - Value: `10000`

5. **REDIS_URL** (optional)
   - Value: Your Redis connection string (if using)

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Watch the logs in real-time
4. First deployment takes **3-5 minutes**
5. Once complete, you'll see: ✅ **"Live"**

### Step 7: Get Your Backend URL

After deployment:
- Your backend URL will be: **`https://spur-backend.onrender.com`** (or similar)
- Copy this URL
- Test it: `https://your-backend-url.onrender.com/health`
- Should return: `{"status":"ok"}`

---

## 📊 Database Setup

### Option A: Use Existing Supabase Database

If you already have a Supabase database:
1. Go to Supabase dashboard
2. Settings → Database
3. Copy the connection string
4. Add as `DATABASE_URL` in Render

### Option B: Create New Database on Render

1. From Render Dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Name: `spur-database`
4. Select **"Free"** plan
5. Click **"Create Database"**
6. Copy the **"Internal Database URL"**
7. Add to your web service as `DATABASE_URL`

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Solution: Check package.json has all dependencies
npm install
```

**Error: "Prisma schema not found"**
```bash
# Solution: Ensure build command includes prisma generate
npm install && npm run build && npx prisma generate
```

### Database Connection Issues

**Error: "Connection timeout"**
- Use **Internal Database URL** if database is on Render
- Use **External Connection String** if using Supabase
- Check DATABASE_URL format: `postgresql://user:pass@host:port/db`

### API Not Responding

**Check logs:**
1. Render Dashboard → Your service
2. Click **"Logs"** tab
3. Look for errors in startup

**Health check failing:**
- Ensure `/health` endpoint exists
- Check PORT environment variable
- Verify server is listening on `0.0.0.0` not `localhost`

---

## 🌐 Update Frontend

After backend is deployed on Render:

1. Note your backend URL: `https://spur-backend.onrender.com`
2. Go to Vercel Dashboard → spur-frontend
3. Settings → Environment Variables
4. Update `VITE_API_BASE_URL` to: `https://spur-backend.onrender.com`
5. Redeploy frontend

---

## 💰 Render Pricing

### Free Tier
- ✅ Good for testing
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold start: 30-60 seconds to wake up
- ✅ 750 hours/month free

### Starter ($7/month)
- ✅ Always on (no cold starts)
- ✅ Better performance
- ✅ Custom domains
- ✅ Recommended for production

---

## 🔄 Auto-Deploy

Render automatically redeploys when you push to GitHub:

```bash
cd d:\spur\backend
git add .
git commit -m "Update backend"
git push origin main
# Render automatically detects and deploys!
```

---

## 📝 Render.yaml Configuration

Your `render.yaml` file configures everything:

```yaml
services:
  - type: web
    name: spur-backend
    env: node
    buildCommand: npm install && npm run build && npx prisma generate
    startCommand: npm start
    healthCheckPath: /health
```

This enables **Infrastructure as Code** - your deployment is version controlled!

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service created and connected to GitHub
- [ ] Environment variables added (DATABASE_URL, CLAUDE_API_KEY)
- [ ] First deployment successful
- [ ] Health endpoint returns OK
- [ ] Test API endpoints
- [ ] Frontend updated with new backend URL
- [ ] End-to-end test successful

---

## 🎯 Next Steps

1. Deploy backend to Render (follow steps above)
2. Get backend URL
3. Update frontend environment variable
4. Test chat functionality
5. Done! 🎉

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status**: https://status.render.com

---

**Created**: December 31, 2025  
**Backend Repository**: https://github.com/gudaykiran/spur-backend  
**Deployment Platform**: Render
