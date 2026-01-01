# Environment Variables Reference

This project uses the following environment variables, which are already configured in Vercel:

## Database (Supabase)
- `POSTGRES_URL` - PostgreSQL connection URL
- `POSTGRES_PRISMA_URL` - Prisma-compatible connection URL
- `POSTGRES_URL_NON_POOLING` - Direct database connection
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name
- `POSTGRES_HOST` - Database host

## Supabase Auth
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_SECRET_KEY` - Supabase secret key
- `SUPABASE_JWT_SECRET` - JWT secret for token validation
- `SUPABASE_PUBLISHABLE_KEY` - Public key for client-side

## Public Environment Variables (Client-side)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL for client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key for client
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Development redirect URL for auth

## Foru.ms API
- `FORU_MS_API_KEY` - API key for Foru.ms authentication
- `FORU_MS_API_URL` - Base URL for Foru.ms API

## AI Integration
- `GEMINI_API_KEY` - Google Gemini API key for AI features

## How to Use

All these variables are automatically available in your code:

### Server-side (Route Handlers, Server Actions, Server Components)
```typescript
const apiKey = process.env.FORU_MS_API_KEY
const dbUrl = process.env.POSTGRES_URL
```

### Client-side (Client Components)
Only variables prefixed with `NEXT_PUBLIC_` are available:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
```

## Managing Variables

Environment variables are managed in the Vercel dashboard or v0 UI under the "Vars" section in the in-chat sidebar. **No .env file is needed or supported in v0 projects.**

## Local Development

If you download this project and run it locally, you'll need to create a `.env.local` file with these variables. You can get the values from:
1. The Vercel dashboard for your project
2. The Supabase dashboard for database credentials
3. Your Foru.ms account for API keys
4. Google AI Studio for Gemini API key
