export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
] as const

export type LanguageCode = typeof LANGUAGES[number]['code']

export interface LookupRequest {
  word: string
  targetLanguage: string
  nativeLanguage: string
}

export interface ExampleSentence {
  sentence: string
  translation: string
}

export interface LookupResult {
  word: string
  phonetic?: string // Phonetic transcription (音标)
  definition: string // Native language definition
  definitionTarget: string // Target language definition
  imageUrl: string
  examples: ExampleSentence[]
  usageNote: string
  audioUrl?: string
  isValidWord?: boolean // Whether this is a recognized word in the language
  suggestedWord?: string // Suggested correct spelling if misspelled
  source?: 'database' | 'user_edit' | 'llm' // Where the definition came from
  wordDefinitionId?: string // ID of the word definition in database (for editing)
  targetLanguage?: string // Target language code
  nativeLanguage?: string // Native language code
}

export interface NotebookEntry {
  id: string
  word: string
  phonetic?: string // Phonetic transcription (音标)
  targetLanguage: string
  nativeLanguage: string
  definition: string
  definitionTarget?: string // Target language definition (optional for backward compatibility)
  imageUrl?: string
  audioUrl?: string
  exampleSentence1: string
  exampleSentence2: string
  exampleTranslation1: string
  exampleTranslation2: string
  usageNote: string
  tags?: string[] // Tags for categorization
  firstLearnedDate?: string // Date when word was first learned
  createdAt: string
}

export interface Story {
  id: string
  content: string
  translation: string
  wordsUsed: string[]
  createdAt: string
}

export interface Flashcard {
  id: string
  word: string
  phonetic?: string // Phonetic transcription (音标)
  imageUrl?: string
  definition: string // Native language definition
  definitionTarget?: string // Target language definition (learning language)
  exampleSentence: string
  exampleTranslation: string
  targetLanguage: string
}
