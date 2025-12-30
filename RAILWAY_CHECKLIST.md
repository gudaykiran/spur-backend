# ✅ Railway Deployment Checklist

## Pre-Deployment Verification

### Code Configuration
- [x] `package.json` has correct build scripts
- [x] `railway.json` configured
- [x] `nixpacks.toml` created
- [x] `tsconfig.json` properly set
- [x] Server uses `process.env.PORT`
- [x] Health check endpoint `/health` implemented
- [x] CORS configured for production
- [x] Environment variables loaded with dotenv
- [x] Prisma schema validated
- [x] `.gitignore` excludes sensitive files

### Required Files
- [x] `src/server.ts` - Server entry point
- [x] `src/app.ts` - Express app
- [x] `prisma/schema.prisma` - Database schema
- [x] `railway.json` - Railway config
- [x] `nixpacks.toml` - Build config
- [x] `.env.example` - Environment template
- [x] `.env.railway` - Railway template

## Railway Setup

### Account & Project
- [ ] Railway account created
- [ ] GitHub connected to Railway
- [ ] New project created
- [ ] Repository linked

### Environment Variables (Required)
- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `CLAUDE_API_KEY` - Anthropic API key
- [ ] `NODE_ENV=production`
- [ ] `PORT` (auto-set by Railway)

### Environment Variables (Optional)
- [ ] `REDIS_URL` - Redis cache
- [ ] `FRONTEND_URL` - CORS origin
- [ ] `OPENAI_API_KEY` - If using GPT
- [ ] `GEMINI_API_KEY` - If using Gemini

### Database Setup
- [ ] PostgreSQL database created (Supabase/Railway/Neon)
- [ ] Database connection string obtained
- [ ] Database accessible from Railway
- [ ] Prisma migrations ready

## Deployment Steps

### Initial Deploy
- [ ] Push code to GitHub
- [ ] Railway detects repository
- [ ] Build starts automatically
- [ ] Dependencies installed
- [ ] Prisma client generated
- [ ] TypeScript compiled
- [ ] Server starts successfully

### Post-Deploy
- [ ] Deployment successful (check logs)
- [ ] Service health check passes
- [ ] Domain generated
- [ ] Custom domain configured (optional)

## Testing

### Endpoint Tests
```bash
# Test each endpoint after deployment

# 1. Health check
curl https://your-app.railway.app/health
# Expected: {"status":"ok"}

# 2. Chat endpoint
curl -X POST https://your-app.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "message": "Hello, AI!"
  }'
# Expected: JSON response with AI message

# 3. Error handling
curl https://your-app.railway.app/api/nonexistent
# Expected: 404 error

# 4. CORS headers
curl -I https://your-app.railway.app/health
# Expected: Access-Control-Allow-Origin header
```

### Verification Checklist
- [ ] `/health` returns 200 OK
- [ ] `/api/chat` accepts POST requests
- [ ] CORS headers present
- [ ] Error responses formatted correctly
- [ ] Response times acceptable (<1s)
- [ ] No 500 errors in logs

## Database Verification

### Prisma
- [ ] Prisma client generated
- [ ] Database connection successful
- [ ] Tables created (Conversation, Message)
- [ ] Migrations applied
- [ ] Can query database

### Test Database Connection
```bash
# Using Railway CLI
railway run npx prisma studio
railway run npx prisma db pull
```

## Monitoring Setup

### Railway Dashboard
- [ ] Logs visible and clean
- [ ] Metrics showing (CPU, Memory)
- [ ] No errors or warnings
- [ ] Health checks passing
- [ ] Deployment history visible

### Alerts (Optional)
- [ ] Email notifications enabled
- [ ] Slack integration configured
- [ ] Error tracking setup (Sentry)

## Performance

### Load Testing
- [ ] Test with 10 concurrent requests
- [ ] Verify response times
- [ ] Check memory usage
- [ ] Monitor CPU usage

### Optimization
- [ ] Redis cache configured (optional)
- [ ] Compression enabled
- [ ] Connection pooling enabled
- [ ] Rate limiting implemented

## Security

### Best Practices
- [ ] Environment variables never in code
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS only (Railway provides)
- [ ] API keys secured
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive info

## Frontend Integration

### Update Frontend
- [ ] Railway URL obtained
- [ ] Frontend `VITE_API_BASE_URL` updated
- [ ] Frontend redeployed
- [ ] End-to-end test successful
- [ ] Chat widget working
- [ ] Messages sending/receiving

## Production Readiness

### Final Checks
- [ ] All endpoints tested
- [ ] Database working
- [ ] Logs clean (no errors)
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Frontend connected
- [ ] Documentation updated
- [ ] Team notified

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure alerting
- [ ] Document incident response
- [ ] Plan for scaling

## Rollback Plan

### If Something Goes Wrong
1. Check Railway logs for errors
2. Verify environment variables
3. Test database connection
4. Check Prisma migrations
5. Review recent code changes
6. Rollback to previous deployment if needed

### Railway Rollback
```bash
# Via Railway Dashboard
# 1. Go to Deployments
# 2. Click on previous successful deployment
# 3. Click "Redeploy"
```

## Support Resources

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Prisma Docs: https://www.prisma.io/docs
- Project README: README.md
- Deployment Guide: RAILWAY_DEPLOYMENT.md

## Success Criteria

✅ All checks above completed
✅ Health endpoint returns 200
✅ Chat API working correctly
✅ No errors in logs
✅ Performance acceptable
✅ Frontend integrated
✅ Team can access and test

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Railway URL**: _____________

**Notes**: 
_____________________________________________
_____________________________________________
_____________________________________________
