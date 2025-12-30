# Railway Deployment Guide - Backend

## 🚀 Quick Deploy (2-3 minutes!)

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- Database URL (Supabase/PostgreSQL)
- Claude API key

### Step 1: Go to Railway
- Open: **https://railway.app**
- Click **"Login"** → Sign in with **GitHub**

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Railway will auto-detect Node.js! ✅

### Step 3: Add Environment Variables
Click on your service → **"Variables"** tab → Add these:

```env
# Required Environment Variables
DATABASE_URL=postgresql://user:password@host:port/database
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
NODE_ENV=production
PORT=3000

# Optional - Redis Cache (Upstash or Railway Redis)
REDIS_URL=redis://default:password@host:port
```

**Important Notes:**
- `DATABASE_URL`: Use your Supabase or PostgreSQL connection string
- `CLAUDE_API_KEY`: Get from https://console.anthropic.com/
- `PORT`: Railway will automatically set this, but 3000 is default
- `REDIS_URL`: Optional, for caching (improves performance)

### Step 4: Deploy!
- Railway automatically starts deploying
- Watch the logs in real-time
- **Deployment takes 2-3 minutes** ⚡
- Build process:
  1. Installs dependencies
  2. Generates Prisma client
  3. Compiles TypeScript
  4. Starts the server

Once done, you'll see: **"Success"**

### Step 5: Run Database Migrations
After first deployment:
1. Click on your service
2. Go to **"Settings"** → **"Variables"**
3. Add a new variable: `DATABASE_URL` (if not already added)
4. Railway will automatically run `prisma generate` on build
5. For migrations, you may need to run: `npx prisma migrate deploy` in Railway shell

Or use Railway CLI:
```bash
railway run npx prisma migrate deploy
```

### Step 6: Get Your URL
1. Click **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy the URL: `https://your-app.up.railway.app`

### Step 7: Test Your Deployment
```bash
# Health check
curl https://your-app.up.railway.app/health

# Should return
{"status":"ok"}

# Test chat endpoint
curl -X POST https://your-app.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "message": "Hello!"
  }'
```

---

## 📋 Configuration Files

This project includes the following Railway-specific files:

### 1. `railway.json`
Defines Railway deployment configuration:
- Build command and builder
- Start command
- Health check endpoint
- Restart policies

### 2. `nixpacks.toml`
Optimizes the build process:
- Specifies Node.js 20
- Includes OpenSSL for Prisma
- Defines build phases
- Sets production environment

### 3. `package.json`
Updated scripts:
- `build`: Generates Prisma client + compiles TypeScript
- `start`: Runs the production server
- `postinstall`: Ensures Prisma client is generated
- `migrate:deploy`: Runs database migrations in production

---

## 🔄 Automatic Deployments

Railway automatically deploys when you push to your main branch:

1. Make changes to your code
2. Commit and push to GitHub
3. Railway detects the change
4. Automatically builds and deploys
5. Zero downtime deployment! 🎉

To disable auto-deploy:
- Go to **Settings** → **Deployment**
- Toggle off **"Auto-Deploy"**

---

## 🔧 Advanced Configuration

### Adding Redis Cache (Optional but Recommended)

1. In Railway dashboard, click **"New"** → **"Database"** → **"Redis"**
2. Railway provides Redis URL automatically
3. Copy the `REDIS_URL` from Redis service variables
4. Add it to your backend service variables

### Custom Domain

1. Go to **Settings** → **"Domains"**
2. Click **"Custom Domain"**
3. Enter your domain
4. Update DNS records as instructed
5. Railway handles SSL automatically! 🔒

### Environment-Specific Builds

Add different environment variables for staging/production:
- Create separate Railway projects for staging and production
- Use different DATABASE_URL for each environment
- Use Railway environments feature

---

## 📊 Monitoring & Logs

### View Logs
1. Click on your service
2. Go to **"Deployments"**
3. Click on active deployment
4. View real-time logs

### Metrics
Railway shows:
- ✅ CPU usage
- ✅ Memory usage
- ✅ Network traffic
- ✅ Request count
- ✅ Response times

### Health Checks
Railway automatically monitors `/health` endpoint:
- Checks every 30 seconds
- Restarts service if unhealthy
- Configurable in `railway.json`

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check logs in Railway dashboard
# Common issues:
# 1. Missing environment variables
# 2. Database connection issues
# 3. Prisma migration errors

# Solution: Ensure all env vars are set
```

### Database Connection Issues
```bash
# Verify DATABASE_URL format:
postgresql://user:password@host:port/database

# Test connection:
railway run npx prisma db pull
```

### Prisma Client Errors
```bash
# Regenerate Prisma client:
railway run npx prisma generate

# Run migrations:
railway run npx prisma migrate deploy
```

### Port Issues
```bash
# Railway automatically sets PORT
# Don't hardcode port numbers
# Use: process.env.PORT || 3000
```

### Redis Connection Issues
```bash
# Check REDIS_URL format
# Redis is optional, app will work without it
# Logs will show: "Redis not configured, using in-memory cache"
```

---

## 💰 Pricing

### Starter Plan (FREE)
- ✅ $5 free credit/month
- ✅ ~500 hours of usage
- ✅ Perfect for development and testing
- ✅ Sleeps after inactivity (wakes on request)

### Developer Plan ($5/month)
- ✅ $5/month + usage
- ✅ Always on (no sleeping)
- ✅ Unlimited projects
- ✅ Priority support

### Hobby Plan ($20/month)
- ✅ More resources
- ✅ Better for production
- ✅ Higher resource limits

---

## ✅ Why Railway?

- ⚡ **Fast deploys** (2-3 minutes)
- 🚀 **Auto-deploy** on git push
- 💰 **Generous free tier** ($5/month)
- 📊 **Excellent logging and monitoring**
- 🔧 **Simple configuration**
- 🎯 **Built for Node.js/TypeScript**
- 🔒 **Automatic SSL**
- 🌐 **Global CDN**
- 📦 **Integrated databases**

---

## 🔄 CI/CD Integration

Railway works great with GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      # Railway auto-deploys after tests pass
```

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Prisma on Railway](https://docs.railway.app/guides/prisma)
- [Node.js on Railway](https://docs.railway.app/guides/nodejs)
- [Railway CLI](https://docs.railway.app/develop/cli)

---

## 🎯 Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Test all endpoints
3. ✅ Update frontend environment variables
4. ✅ Deploy frontend to Netlify/Vercel
5. ✅ Connect frontend to Railway backend URL
6. ✅ Test end-to-end chat functionality

**Your backend will be live and production-ready in minutes!** 🚀
