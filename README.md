# AI Dictionary - Simple Language Learning App

An AI-powered dictionary application that helps users learn languages through natural definitions, visualizations, audio pronunciations, and interactive study tools.

**No database required!** All data is stored in browser localStorage.

## Features

- **Language Selection**: Choose from 10 most popular languages
- **AI-Powered Lookups**: Natural language definitions, AI-generated images, and example sentences
- **Audio Pronunciation**: Clear, natural-sounding audio for words and sentences
- **Notebook**: Save words/phrases in browser localStorage
- **Story Generation**: AI creates stories using saved words to help memorization
- **Study Mode**: Interactive flashcards with flip animations
- **Mobile Optimized**: Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Storage**: Browser localStorage (no database needed!)
- **AI Services**: OpenAI (GPT-4, DALL-E 3, TTS)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key (with access to GPT-4 and DALL-E 3)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd dictionary-zara\ copy
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

That's it! No database setup required. 🎉

## Project Structure

```
/app
  /api              # API routes (lookup, audio only)
  /components       # React components
  /lib              # Utilities (AI client, storage, types)
  /notebook         # Notebook page
  /study            # Study mode page
  page.tsx          # Main dictionary page
```

## How It Works

### Storage
- **Notebook entries**: Stored in `localStorage` (browser)
- **Stories**: Stored in `localStorage`
- **No backend database**: Everything is client-side

### API Routes
- `/api/lookup` - Generate definitions, examples, and images
- `/api/audio` - Generate audio pronunciations
- `/api/notebook`, `/api/story`, `/api/flashcards` - Placeholder routes (not used, client-side only)

## Usage

1. **Look up a word**: Select languages, enter a word/phrase/sentence
2. **Save to notebook**: Click "Save to Notebook" on any result
3. **View notebook**: Go to Notebook page to see all saved words
4. **Generate stories**: Select words in notebook and click "Generate Story"
5. **Study with flashcards**: Go to Study mode to practice

## Environment Variables

Only one required variable:
- `OPENAI_API_KEY` - Your OpenAI API key

Optional:
- `NEXT_PUBLIC_APP_URL` - App URL (defaults to http://localhost:3000)

## Development

- Run dev server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Lint code: `npm run lint`

## Notes

- Data is stored in browser localStorage, so it's device-specific
- Clear browser data will clear your notebook
- Audio and images are generated on-demand
- Ensure you have sufficient OpenAI API credits for image generation

## Deployment

Deploy to Vercel, Netlify, or any static hosting:

1. Build the project: `npm run build`
2. Deploy the `.next` folder
3. Set `OPENAI_API_KEY` in your hosting environment variables

## License

MIT
