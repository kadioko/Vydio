# Vydio - AI Video Generator

A Next.js 14 web application that allows users to generate AI videos using Google's Veo model via the Gemini API, featuring a credit-based payment system integrated with Snippe.

## Features

- **Google Veo Video Generation**: Turn text prompts into stunning videos.
- **Credit System**: Users purchase credits to generate videos (1 credit = 4 seconds).
- **Authentication**: Secure Google login via NextAuth.
- **Payments**: Integrated with Snippe.sh for hosted checkout and secure webhooks.
- **Robust Job Polling**: Status updates and error handling during video generation.
- **Modern UI**: Built with TailwindCSS and Lucide icons.

## Prerequisites

- Node.js 18+
- PostgreSQL database (e.g., local, Neon, Supabase)
- Google Cloud project with Gemini API enabled
- Snippe.sh account and API keys
- Google OAuth credentials (for NextAuth)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vydio?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generate-secret-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Gemini API
GEMINI_API_KEY="your-google-gemini-api-key"

# Snippe Payments
SNIPPE_API_KEY="your-snippe-api-key"
SNIPPE_WEBHOOK_SECRET="your-snippe-webhook-signing-secret"
APP_URL="http://localhost:3000" # Change this in production
```

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *(Note: For production, you should use `npx prisma migrate dev` instead to track migration history)*

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing Snippe Payments Locally

To test webhooks locally, you need to expose your localhost to the internet so Snippe can reach it.

1. **Install and run ngrok:**
   ```bash
   ngrok http 3000
   ```

2. **Update your `.env` file:**
   Change `APP_URL` to your ngrok URL (e.g., `https://1a2b-3c4d.ngrok-free.app`).

3. **Configure Snippe Webhook:**
   - Go to your Snippe dashboard.
   - Add a webhook endpoint pointing to your ngrok URL + `/api/payments/snippe/webhook`.
   - Copy the webhook secret into your `.env` file (`SNIPPE_WEBHOOK_SECRET`).

4. **Test checkout:**
   Use the Snippe sandbox/test mode if available to complete a transaction without real money.

## Vercel Deployment

1. Push your code to a GitHub repository.
2. Go to Vercel and import the repository.
3. Configure the Environment Variables in the Vercel project settings (same as your local `.env`, but update `NEXTAUTH_URL` and `APP_URL` to your production domain).
4. Set the Build Command (if not auto-detected) to: `npx prisma generate && next build`
5. Deploy!

## Notes on the Gemini Veo Implementation

The current implementation in `src/app/api/jobs/route.ts` uses the standard Google REST API pattern for asynchronous generation tasks since specific official SDK methods for Veo might still be in preview. Adjust the endpoint or payload structure based on the exact Veo API documentation provided by Google.

## License

MIT
