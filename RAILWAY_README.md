# 🚂 Railway Deployment Quick Start

This backend is **production-ready** and optimized for Railway deployment.

## 🎯 One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## ⚡ Manual Deployment (3 minutes)

### 1. Prerequisites
- [Railway Account](https://railway.app) (free)
- GitHub repository with this code
- Database URL (Supabase/PostgreSQL)
- Claude API key from [Anthropic](https://console.anthropic.com/)

### 2. Deploy Steps

```bash
# Option A: Railway CLI (Recommended)
npm install -g @railway/cli
railway login
railway init
railway up

# Option B: GitHub Integration
# 1. Go to https://railway.app
# 2. New Project → Deploy from GitHub
# 3. Select your repository
# 4. Railway auto-detects and deploys! ✅
```

### 3. Environment Variables

Add these in Railway Dashboard → Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `CLAUDE_API_KEY` | Anthropic API key | ✅ Yes |
| `NODE_ENV` | Set to `production` | ✅ Yes |
| `REDIS_URL` | Redis connection (optional) | ⭐ Recommended |
| `PORT` | Auto-set by Railway | ℹ️ Auto |

**Example:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
CLAUDE_API_KEY=sk-ant-api03-xxxxx
NODE_ENV=production
```

### 4. Verify Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-app.railway.app/health

# Chat endpoint
curl -X POST https://your-app.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test","message":"Hello!"}'
```

## 📋 What's Configured

This project includes:

✅ **railway.json** - Deployment configuration  
✅ **nixpacks.toml** - Build optimization  
✅ **package.json** - Production scripts  
✅ **Prisma migrations** - Auto-deploy ready  
✅ **Health checks** - `/health` endpoint  
✅ **TypeScript build** - Optimized compilation  
✅ **Auto-restart** - On failure policies  

## 🔧 Configuration Files

### `railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ['nodejs_20', 'openssl']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm start'
```

## 🚀 Features

- **Auto-deploy** on git push
- **Zero-downtime** deployments
- **Health checks** every 30s
- **Auto-restart** on failures
- **Prisma** migrations on build
- **TypeScript** compilation
- **Redis** caching support (optional)

## 📊 Monitoring

Railway Dashboard provides:
- Real-time logs
- CPU/Memory metrics
- Request analytics
- Deployment history
- Build logs

## 🔄 CI/CD

Auto-deploys on every push to main:

1. Push code to GitHub
2. Railway detects change
3. Builds automatically
4. Deploys with zero downtime
5. Health check verifies deployment

## 🐛 Troubleshooting

### Build fails?
```bash
# Check Railway logs
# Ensure all environment variables are set
# Verify DATABASE_URL is correct
```

### Database connection issues?
```bash
# Test Prisma connection
railway run npx prisma db pull

# Run migrations manually
railway run npx prisma migrate deploy
```

### App not starting?
```bash
# Check logs in Railway dashboard
# Verify PORT is not hardcoded
# Ensure health check endpoint works
```

## 📚 Documentation

- **Detailed Guide**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- **Environment Template**: [.env.railway](./.env.railway)
- **API Docs**: [README.md](./README.md)

## 💰 Cost

- **Free tier**: $5 credit/month (~500 hours)
- **Developer**: $5/month + usage
- **Production**: Scales with usage

## 🎯 Next Steps

1. ✅ Deploy to Railway
2. ✅ Add environment variables
3. ✅ Test endpoints
4. ✅ Update frontend with Railway URL
5. ✅ Enable auto-deploy
6. ✅ Monitor in dashboard

## 🆘 Support

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [GitHub Issues](../../issues)

---

**Happy deploying! 🚂**
