# Database Setup for PromptNest Deployment

## Quick Setup Instructions

### Option 1: Render PostgreSQL (Recommended)

1. **Go to Render Dashboard** → Click "New" → "PostgreSQL"
2. **Database Configuration:**
   - Name: `promptnest-db`
   - Database Name: `promptnest`
   - User: `promptnest`
   - Region: Same as your web service
   - Plan: Free

3. **Copy the External Database URL** (looks like: `postgresql://user:password@host:port/database`)

4. **Add to Web Service Environment Variables:**
   - Key: `DATABASE_URL`
   - Value: (paste the database URL)
   - Key: `OPENROUTER_API_KEY`
   - Value: (your OpenRouter API key)

### Option 2: Neon (Alternative Free PostgreSQL)

If you prefer Neon database:
1. Go to https://neon.tech
2. Create free account and database
3. Copy connection string
4. Add to Render environment variables as above

## Connection String Format

Your DATABASE_URL should look like:
```
postgresql://username:password@hostname:port/database_name
```

## After Adding Database URL

1. Render will automatically redeploy
2. Your app will connect to the database
3. Tables will be created automatically via Drizzle ORM
4. PromptNest will be live and functional

## Verification

Once deployed, your app will be available at:
`https://your-service-name.onrender.com`

The health check endpoint will confirm database connectivity:
`https://your-service-name.onrender.com/api/stats`