# Vercel Deployment Guide - Backend

Complete step-by-step guide to deploy the Express.js backend on Vercel.

## 📋 Prerequisites

- [Vercel Account](https://vercel.com) (sign up with GitHub)
- GitHub repository with backend code pushed
- PostgreSQL database (Supabase recommended)
- Anthropic Claude API key
- Redis instance (Upstash recommended for serverless)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. Push backend code to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/ai-chat-backend.git
git push -u origin main
```

2. Verify files are in place:
   - ✅ `src/` folder with server code
   - ✅ `prisma/` folder with schema
   - ✅ `package.json`
   - ✅ `tsconfig.json`
   - ✅ `vercel.json`
   - ✅ `.env.example`
   - ✅ `.gitignore`

### Step 2: Set Up Database (Supabase)

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Get connection string:
   - Go to Settings → Database → Connection String
   - Select "node" tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual password

3. Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/[database]"
CLAUDE_API_KEY="sk-ant-xxxxx"
REDIS_URL="https://[host]:[port]"
```

4. Run migrations locally first:
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

### Step 3: Set Up Redis (Upstash)

1. Create account at [Upstash.com](https://upstash.com)
2. Create Redis database
3. Copy Redis URL from console
4. Add to `.env` as `REDIS_URL`

> **Note**: Redis is optional. App works without it (uses database instead)

### Step 4: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from backend directory)
cd backend
vercel

# Follow prompts:
# - Link to GitHub repo: Yes
# - Link to existing project: No (first time)
# - Project name: ai-chat-backend
# - Framework: Other
```

#### Option B: Using Vercel Web Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import GitHub repository
4. Select your `ai-chat-backend` repository
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./backend` (if monorepo) or leave blank
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Click "Deploy"

### Step 5: Configure Environment Variables

In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add each variable:

```
DATABASE_URL="postgresql://..."
CLAUDE_API_KEY="sk-ant-..."
REDIS_URL="https://..." (optional)
NODE_ENV="production"
```

3. Select environment:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Step 6: Run Database Migrations in Production

After initial deployment, run migrations on the production database:

**Option A: Via Vercel CLI**
```bash
vercel env pull
npx prisma migrate deploy
```

**Option B: Via Vercel Dashboard**
1. Go to Deployments
2. Find latest deployment
3. Click "Deployment" dropdown
4. Open deployment URL and verify API is running
5. Use Prisma Studio: `npx prisma studio`

### Step 7: Test the Deployment

```bash
# Get your Vercel deployment URL
# Format: https://ai-chat-backend-xxxxx.vercel.app

# Test health endpoint
curl https://ai-chat-backend-xxxxx.vercel.app/api/chat/health

# Test chat endpoint
curl -X POST https://ai-chat-backend-xxxxx.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'

# Expected response:
# {"reply": "...", "sessionId": "..."}
```

## ⚙️ Configuration Details

### vercel.json Explained

```json
{
  "version": 2,                          // Vercel Functions v2
  "buildCommand": "npm run build",       // TypeScript compilation
  "env": {                               // Required env variables
    "DATABASE_URL": {},                  // PostgreSQL connection
    "CLAUDE_API_KEY": {}                 // AI API key
  },
  "functions": {
    "src/server.ts": {
      "memory": 1024,                    // 1GB RAM per function
      "maxDuration": 60                  // 60s timeout
    }
  }
}
```

### Recommended Settings

**Memory**: 1024 MB (sufficient for Express + Prisma)
**Timeout**: 60 seconds (enough for database queries)
**Regions**: Select closest to your database

## 🔧 Troubleshooting

### Build Fails: "Cannot find module"

**Solution**: Ensure all dependencies in package.json:
```bash
npm install  # Add missing packages
git add package-lock.json
git push
```

### "CLAUDE_API_KEY not set" Error

**Solution**: Check Vercel environment variables:
1. Go to Settings → Environment Variables
2. Verify `CLAUDE_API_KEY` is added
3. Redeploy project

### Database Connection Timeout

**Solution**: Check DATABASE_URL:
```bash
# Test locally first
DATABASE_URL="..." npm run prisma:migrate -- --status
```

Common issues:
- Wrong password in connection string
- IP whitelist (if using managed database)
- Network firewall blocking access

### Cold Start Issues

**Solution**: Vercel may take 5-10s on first request (cold start)

To improve:
1. Increase memory in `vercel.json`: `"memory": 3008`
2. Optimize dependencies (remove unused packages)
3. Use Vercel Pro for faster cold starts

### Prisma Migration Errors

**Solution**: Run migrations manually:
```bash
# Connect to production database
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

## 📊 Monitoring & Logs

### View Logs

1. **Vercel Dashboard**:
   - Go to Project → Deployments
   - Click on deployment
   - View "Logs" tab

2. **Vercel CLI**:
```bash
vercel logs ai-chat-backend.vercel.app
```

### Monitor Performance

1. Go to Project Settings → Analytics
2. View:
   - Request count
   - Response time
   - Error rate
   - Function duration

## 🔐 Security

### Secrets Management

✅ **Good Practice**:
- Store API keys in Vercel environment variables
- Never commit `.env` files
- Use separate keys for dev/prod

❌ **Don't Do**:
- Commit `.env` files to git
- Share Vercel dashboard access unnecessarily
- Reuse API keys across environments

### CORS Configuration

Update `src/app.ts` for your frontend domain:

```typescript
import cors from 'cors';

app.use(cors({
  origin: 'https://chat.yourdomain.com',
  credentials: true
}));
```

## 🚀 Optimization Tips

### Reduce Bundle Size
```bash
# Check bundle
npm run build
ls -lh dist/

# Remove unused dependencies
npm list
npm prune --production
```

### Database Connection Pooling

For multiple serverless functions, use PgBouncer:

```env
DATABASE_URL="postgresql://user:pass@bouncer-host/db?connection_limit=5"
```

### Redis Optimization

Use Upstash Redis connection pooling:
```env
REDIS_URL="https://[token]@[host]:6379?auto_ssl=true"
```

## 🔄 Continuous Deployment

### Auto-Deploy on Push

1. In Vercel Dashboard → Settings
2. Git Integration → Configure
3. Select GitHub repository
4. Enable "Automatic Deployments on Push"

Now every push to main branch auto-deploys!

### Staging Deployments

Push to `develop` branch for preview:
```bash
git push origin develop
# Vercel creates preview deployment
# URL: https://ai-chat-backend-git-develop-xxxxx.vercel.app
```

## 📝 Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Vercel project created and connected
- [ ] Environment variables added (DATABASE_URL, CLAUDE_API_KEY)
- [ ] Build succeeded (check Deployments tab)
- [ ] Database migrations run
- [ ] API endpoints tested and responding
- [ ] CORS configured for frontend domain
- [ ] Monitoring and logs set up
- [ ] Custom domain configured (optional)
- [ ] SSL certificates verified

## 🌐 Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your domain: `api.yourdomain.com`
3. Configure DNS:
   - Point CNAME to `cname.vercel.app`
   - Or use Nameservers provided

4. Wait for DNS propagation (up to 48 hours)

## 💰 Costs

**Vercel Pricing**:
- Hobby (Free): 100 GB bandwidth, basic features
- Pro ($20/month): Unlimited bandwidth, priority support
- Enterprise: Custom pricing

For this project, Hobby tier should be sufficient initially.

## 📞 Support

If issues occur:

1. Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)
2. Check logs in Vercel Dashboard
3. Test locally: `npm run dev`
4. Verify environment variables are set
5. Check database connectivity: `psql $DATABASE_URL`

## Next Steps

After backend deployment:
1. ✅ Copy deployment URL: `https://ai-chat-backend-xxxxx.vercel.app`
2. ✅ Update frontend `.env`: `VITE_API_BASE_URL=<deployment-url>`
3. ✅ Deploy frontend to Netlify/Vercel
4. ✅ Test end-to-end chat flow

---

**Status**: Vercel deployment configured ✅  
**Date**: December 31, 2025
