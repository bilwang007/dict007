# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=your_postgresql_connection_string
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Set up Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup Options

### Option 1: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE dictionary_db;
   ```
3. Use connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dictionary_db"
   ```

### Option 2: Supabase (Recommended for quick start)
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update `.env.local` with the connection string

### Option 3: Vercel Postgres
1. Create a Vercel account
2. Add Vercel Postgres to your project
3. Connection string will be provided automatically

## Getting OpenAI API Key

1. Create account at [platform.openai.com](https://platform.openai.com)
2. Go to API Keys section
3. Create a new API key
4. Add it to `.env.local` as `OPENAI_API_KEY`

**Note:** Image generation via DALL-E 3 requires credits. Ensure you have sufficient credits in your OpenAI account.

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure database server is running (for local PostgreSQL)
- Check firewall/network settings for cloud databases

### OpenAI API Errors
- Verify your API key is correct
- Check your OpenAI account has credits
- Verify you have access to GPT-4 and DALL-E 3 models

### Build Errors
- Delete `node_modules` and `.next` folder
- Run `npm install` again
- Run `npx prisma generate` to regenerate Prisma client

## Next Steps

1. For production, implement user authentication
2. Set up image/audio storage service (AWS S3, Supabase Storage)
3. Configure CDN for faster image/audio delivery
4. Add error monitoring (Sentry, etc.)
5. Set up CI/CD pipeline
