import OpenAI from 'openai'

// Support both OpenAI and SiliconFlow (OpenAI-compatible)
// Lazy initialization - only check API key on server side when actually needed
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    // Client side - throw error if trying to use AI functions
    throw new Error('AI functions can only be called on the server side. Use API routes instead.')
  }
  const API_KEY = process.env.OPENAI_API_KEY || process.env.SILICONFLOW_API_KEY
  if (!API_KEY) {
    throw new Error('API key not set. Please set either OPENAI_API_KEY or SILICONFLOW_API_KEY in environment variables')
  }
  return API_KEY
}

const getApiBase = (): string => {
  return process.env.API_BASE_URL || process.env.SILICONFLOW_API_BASE || 'https://api.siliconflow.cn/v1'
}

// Lazy client initialization - only create when needed (server-side only)
let openaiClient: OpenAI | null = null

const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: getApiKey(),
      baseURL: getApiBase(), // SiliconFlow endpoint
    })
  }
  return openaiClient
}

// Export a proxy that lazily creates the client only when used (server-side)
export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    return getOpenAIClient()[prop as keyof OpenAI]
  }
})

interface LookupResult {
  definition: string
  definitionTarget: string
  examples: Array<{ sentence: string; translation: string }>
  usageNote: string
  isValidWord?: boolean
  suggestedWord?: string
  phonetic?: string
}

// Helper function to parse definitions into individual meanings
export function parseMeanings(definitionTarget: string, definition: string): Array<{ definitionTarget: string; definition: string }> {
  const meanings: Array<{ definitionTarget: string; definition: string }> = []
  
  // Try multiple patterns for splitting numbered lists
  // Pattern 1: Standard numbered list (1. 2. 3.) - match up to next numbered item or end
  // Use positive lookahead for next numbered item pattern (\d+\.\s) instead of negating digits
  // This allows numbers within definitions (e.g., "established in 1990") without breaking parsing
  const numberedPattern1 = /(\d+\.\s.+?)(?=\s*\d+\.\s|$)/gs
  // Pattern 2: Chinese numbered list with better handling of numbers in content
  const numberedPattern2 = /(\d+\.\s.+?)(?=\s*\d+\.\s|$)/gs
  // Pattern 3: Pattern with Chinese punctuation - same improved approach
  const numberedPattern3 = /(\d+\.\s.+?)(?=\s*\d+\.\s|$)/gs
  
  // Try to split target language (English) by numbered list
  let targetMatches = definitionTarget.match(numberedPattern1)
  if (!targetMatches || targetMatches.length < 2) {
    targetMatches = definitionTarget.match(numberedPattern2)
  }
  if (!targetMatches || targetMatches.length < 2) {
    targetMatches = definitionTarget.match(numberedPattern3)
  }
  
  if (targetMatches && targetMatches.length > 1) {
    // Split definition (native/Chinese) - try multiple patterns
    let defMatches = definition.match(numberedPattern1)
    if (!defMatches || defMatches.length < 2) {
      defMatches = definition.match(numberedPattern2)
    }
    if (!defMatches || defMatches.length < 2) {
      defMatches = definition.match(numberedPattern3)
    }
    
    // If Chinese definition has numbered items matching English count
    if (defMatches && defMatches.length === targetMatches.length) {
      // Perfect match - pair them up
      targetMatches.forEach((match, index) => {
        const cleanedTarget = match.replace(/^\d+\.\s*/, '').trim()
        const cleanedDef = defMatches![index].replace(/^\d+\.\s*/, '').trim()
        
        if (cleanedTarget) {
          meanings.push({
            definitionTarget: cleanedTarget,
            definition: cleanedDef,
          })
        }
      })
    } else {
      // Chinese definition doesn't have matching numbered items
      // Try to split by Chinese separators or match semantically
      // Pattern for Chinese: "1. 名词：... 2. 名词：..." or "1. ... 2. ..."
      // Use lookahead for next numbered item instead of negating digits
      const chineseNumberedPattern = /(\d+\.\s*.+?)(?=\s*\d+\.\s|$)/gs
      const chineseMatches = definition.match(chineseNumberedPattern)
      
      if (chineseMatches && chineseMatches.length === targetMatches.length) {
        // Match found with Chinese pattern
        targetMatches.forEach((match, index) => {
          const cleanedTarget = match.replace(/^\d+\.\s*/, '').trim()
          const cleanedDef = chineseMatches[index].replace(/^\d+\.\s*/, '').trim()
          
          if (cleanedTarget) {
            meanings.push({
              definitionTarget: cleanedTarget,
              definition: cleanedDef,
            })
          }
        })
      } else {
        // Fallback: Try to extract by part of speech markers in Chinese
        // Look for patterns like "名词：" "动词：" "形容词：" etc.
        const posPattern = /(名词|动词|形容词|副词|介词|连词|代词|数词|量词|叹词|拟声词)[：:]\s*([^名词动词形容词副词介词连词代词数词量词叹词拟声词]+?)(?=\d+\.|名词|动词|形容词|副词|介词|连词|代词|数词|量词|叹词|拟声词|$)/g
        const posMatches = [...definition.matchAll(posPattern)]
        
        if (posMatches.length === targetMatches.length) {
          targetMatches.forEach((match, index) => {
            const cleanedTarget = match.replace(/^\d+\.\s*/, '').trim()
            const cleanedDef = posMatches[index] ? posMatches[index][0].trim() : ''
            
            if (cleanedTarget && cleanedDef) {
              meanings.push({
                definitionTarget: cleanedTarget,
                definition: cleanedDef,
              })
            }
          })
        } else {
          // Last resort: Split Chinese by common separators and match by index
          // This is less accurate but better than showing all meanings for each
          const chineseParts = definition.split(/[。；;]\s*(?=\d+\.|$)/).filter(p => p.trim())
          
          targetMatches.forEach((match, index) => {
            const cleanedTarget = match.replace(/^\d+\.\s*/, '').trim()
            // Try to find the corresponding Chinese part
            // Look for the part that contains the same number or is at the same index
            let cleanedDef = ''
            
            // First try: Find Chinese part with matching number
            const targetNum = match.match(/^\d+/)?.[0]
            if (targetNum) {
              const matchingChinese = chineseParts.find(p => p.trim().startsWith(targetNum + '.'))
              if (matchingChinese) {
                cleanedDef = matchingChinese.replace(/^\d+\.\s*/, '').trim()
              }
            }
            
            // Fallback: Use by index if available
            if (!cleanedDef && chineseParts[index]) {
              cleanedDef = chineseParts[index].replace(/^\d+\.\s*/, '').trim()
            }
            
            // Final fallback: Use full definition (but this is what we're trying to avoid)
            if (!cleanedDef) {
              cleanedDef = definition
            }
            
            if (cleanedTarget) {
              meanings.push({
                definitionTarget: cleanedTarget,
                definition: cleanedDef,
              })
            }
          })
        }
      }
    }
  } else {
    // Single meaning - return as is
    meanings.push({
      definitionTarget: definitionTarget.trim(),
      definition: definition.trim(),
    })
  }
  
  return meanings
}

export async function generateDefinition(
  word: string,
  targetLanguage: string,
  nativeLanguage: string,
  wikipediaDefinition?: string
): Promise<LookupResult> {
  const targetLangName = getLanguageName(targetLanguage)
  const nativeLangName = getLanguageName(nativeLanguage)

  // Build prompt with Wikipedia definition if available
  const wikiContext = wikipediaDefinition 
    ? `\n\n📚 WIKIPEDIA DEFINITION (PRIMARY SOURCE):\n${wikipediaDefinition}\n\nUse this as the PRIMARY source for the definition. Your role is to:\n1. Use the Wikipedia definition as the main definition\n2. Generate example sentences\n3. Provide usage notes\n4. Translate to ${nativeLangName} if needed`
    : ''

  const prompt = `You are a helpful language learning assistant. The user is learning ${targetLangName} and their native language is ${nativeLangName}.

🚨 CRITICAL INSTRUCTION - READ THIS CAREFULLY 🚨
The user searched for the EXACT word: "${word}"

YOU MUST:
1. Provide a definition for "${word}" EXACTLY as written - DO NOT change it to any other word
2. DO NOT auto-correct the spelling
3. DO NOT assume they meant a different word
4. DO NOT use the definition of a similar word
5. If "${word}" is misspelled, define "${word}" itself, not the correct spelling

${wikiContext ? wikiContext : `🔍 COMPREHENSIVE DEFINITION REQUIREMENT:
- You MUST provide a COMPREHENSIVE definition that covers ALL major meanings of "${word}"
- Reference authoritative sources like Wikipedia, Oxford Dictionary, Cambridge Dictionary, Merriam-Webster, or other reputable dictionaries
- For words with multiple meanings (polysemy), list ALL primary meanings clearly
- Example: "leave" can be:
  * Verb: to go away from, to depart, to abandon
  * Noun: permission to be absent, vacation time, or a leaf (archaic/homophone)
- Organize multiple meanings clearly, starting with the most common usage
- Ensure the definition covers all major parts of speech (noun, verb, adjective, etc.) if applicable`}

If "${word}" is not a recognized word in ${targetLangName}:
- Set "isValidWord" to false
- Set "suggestedWord" to the correct spelling (e.g., if "${word}" is clearly "artifact" misspelled, suggest "artifact")
- Still provide a definition for "${word}" as written (you can explain it's not a standard word)
- In usageNote, you may mention: "Note: This might be a misspelling. Did you mean [suggestedWord]?" but the definition must be for "${word}"

EXAMPLE: If user searches "artifect":
- DO NOT define "artifact"
- Define "artifect" (you can say it's not a recognized word, but define it as written)
- Set isValidWord: false
- Set suggestedWord: "artifact"

EXAMPLE: If user searches "leave":
- Provide BOTH meanings:
  * Verb: to go away from a place or person
  * Noun: permission to be absent (e.g., from work or school)
- Include examples for BOTH meanings
- Note in usageNote if there are homophones or related words (like "leaf")

CRITICAL LANGUAGE REQUIREMENTS - READ CAREFULLY:
1. The "definitionTarget" field MUST be written ENTIRELY in ${targetLangName} (the target language being learned). This is the PRIMARY definition that appears FIRST.
2. The "definition" field MUST be written ENTIRELY in ${nativeLangName} (the user's native language). This is the translation/explanation that appears SECOND.
3. The "sentence" field in examples MUST be written ENTIRELY in ${targetLangName} (target language being learned)
4. The "translation" field in examples MUST be written ENTIRELY in ${nativeLangName} (user's native language)
5. DO NOT write definitionTarget in ${nativeLangName}
6. DO NOT write definition in ${targetLangName}
7. DO NOT write sentences in ${nativeLangName}
8. DO NOT write translations in ${targetLangName}

IMPORTANT: The definitionTarget MUST be a complete, natural definition in ${targetLangName}, not just a translation. It should explain what the word means in ${targetLangName}. For words with multiple meanings, organize them clearly (e.g., "1. [meaning 1] 2. [meaning 2]" or use clear separators).

${wikipediaDefinition ? 'NOTE: Use the Wikipedia definition provided above as the PRIMARY source. Format it properly and ensure it covers all meanings.' : ''}

Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{
  "phonetic": "Phonetic transcription (音标) in IPA format for "${word}". For English, use IPA like /ˈwɜːrd/. For Chinese, use Pinyin like "hàn yǔ". For other languages, use the standard phonetic notation. If the word is not recognized, you may omit this field or use an approximation.",
  "definitionTarget": "${wikipediaDefinition ? 'Format the Wikipedia definition provided above. ' : ''}A COMPREHENSIVE definition written entirely in ${targetLangName}. MUST cover ALL major meanings of the word. For words with multiple meanings (like 'leave', 'bank', 'run'), list ALL primary meanings clearly and organized. ${wikipediaDefinition ? 'Base this on the Wikipedia definition provided. ' : 'Reference authoritative sources. '}Start with the most common meaning. Format: '1. [meaning 1] 2. [meaning 2]' or use clear separators. Be direct, concise, and friendly. No greetings or fillers.",
  "definition": "A COMPREHENSIVE translation or explanation written entirely in ${nativeLangName}. MUST cover ALL major meanings matching the definitionTarget EXACTLY in the same order and format. If definitionTarget has '1. [meaning 1] 2. [meaning 2]', then definition MUST have '1. [translation 1] 2. [translation 2]' in the EXACT same order. Each numbered item in definition must correspond to the same numbered item in definitionTarget. This helps the user understand the word in their native language. Be direct, concise, and friendly. No greetings or fillers. Get straight to the point.",
  "examples": [
    {
      "sentence": "Example sentence 1 written entirely in ${targetLangName} language that demonstrates meaning 1",
      "translation": "Translation of sentence 1 written entirely in ${nativeLangName} language",
      "meaningIndex": 1
    },
    {
      "sentence": "Example sentence 2 written entirely in ${targetLangName} language that demonstrates meaning 1",
      "translation": "Translation of sentence 2 written entirely in ${nativeLangName} language",
      "meaningIndex": 1
    }
  ],
  "usageNote": "A fun, lively, casual explanation about cultural nuance, tone/voice, related words, synonyms, homophones, or words that look similar and differ in usage. If the word has multiple meanings, mention how to distinguish them in context. Write like you're talking to a friend - be concise, engaging, and get to the point immediately. No textbook language. IMPORTANT: Provide the usage note in BOTH languages - first in ${targetLangName}, then in ${nativeLangName}, separated by a clear divider (e.g., '---' or '|'). Format: '[${targetLangName} explanation] | [${nativeLangName} explanation]' or similar bilingual format.",
  
CRITICAL INSTRUCTIONS FOR EXAMPLES:
- If the word has multiple meanings (e.g., "1. Noun: bank (financial) 2. Noun: bank (river) 3. Verb: to bank"), you MUST provide examples for EACH meaning.
- Set "meaningIndex" to the number of the meaning (1, 2, 3, etc.) that the example demonstrates.
- Provide at least 2 examples per meaning.
- Examples should clearly demonstrate the specific meaning they're assigned to.
- Example: For "bank" meaning 1 (financial institution), use "I need to go to the bank" (meaningIndex: 1).
- Example: For "bank" meaning 2 (river edge), use "We sat on the river bank" (meaningIndex: 2).
  "isValidWord": true,
  "suggestedWord": ""
}

IMPORTANT: Set "isValidWord" to false if "${word}" is not a recognized word in ${targetLangName}. Set "suggestedWord" to the correct spelling if you can determine it (e.g., if "${word}" is clearly misspelled), otherwise use an empty string "".`

  // Use SiliconFlow DeepSeek-V3 model for text generation
  const model = process.env.AI_MODEL || 'deepseek-ai/DeepSeek-V3'
  
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful language learning assistant. Always respond with valid JSON only, no markdown formatting.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5, // Lower temperature for faster, more consistent responses
    response_format: { type: 'json_object' },
    max_tokens: 800, // Limit response length for faster generation
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    const parsed = JSON.parse(content) as any
      
      // CRITICAL: Verify the definition is for the exact word searched, not a corrected version
      const definitionText = (parsed.definitionTarget || parsed.definition || '').toLowerCase()
      const searchedWord = word.toLowerCase()
      
      // Check if definition mentions the correct spelling instead of the searched word
      // This is a heuristic to detect auto-correction
      if (parsed.suggestedWord && definitionText.includes(parsed.suggestedWord.toLowerCase()) && 
          !definitionText.includes(searchedWord)) {
        console.warn(`AI auto-corrected "${word}" to "${parsed.suggestedWord}". Forcing definition for exact word.`)
        // Force the definition to be about the exact word searched
        parsed.definitionTarget = `"${word}" is not a recognized word in ${targetLangName}. It might be a misspelling of "${parsed.suggestedWord}".`
        parsed.definition = `"${word}" 不是 ${targetLangName} 中的标准词汇。可能是 "${parsed.suggestedWord}" 的拼写错误。`
        parsed.isValidWord = false
        // Clear examples that might reference the wrong word
        parsed.examples = []
        parsed.usageNote = `Note: "${word}" appears to be misspelled. Did you mean "${parsed.suggestedWord}"?`
      }
      
      // Additional check: If the definition starts with the correct spelling (like "An 'artifact'...")
      // but the searched word is different, replace it
      if (parsed.suggestedWord && parsed.definitionTarget) {
        const suggestedLower = parsed.suggestedWord.toLowerCase()
        const definitionLower = parsed.definitionTarget.toLowerCase()
        // Check if definition starts with the suggested word (correct spelling) instead of searched word
        if (definitionLower.includes(`'${suggestedLower}'`) || definitionLower.includes(`"${suggestedLower}"`) || 
            definitionLower.startsWith(`an ${suggestedLower}`) || definitionLower.startsWith(`a ${suggestedLower}`)) {
          console.warn(`Definition uses correct spelling "${parsed.suggestedWord}" instead of searched word "${word}". Replacing.`)
          // Replace the correct spelling with the searched word in the definition
          parsed.definitionTarget = parsed.definitionTarget
            .replace(new RegExp(`'${parsed.suggestedWord}'`, 'gi'), `'${word}'`)
            .replace(new RegExp(`"${parsed.suggestedWord}"`, 'gi'), `"${word}"`)
            .replace(new RegExp(`\\b${parsed.suggestedWord}\\b`, 'gi'), word)
          parsed.isValidWord = false
        }
      }
      
    // Log if definitionTarget is missing for debugging
    if (!parsed.definitionTarget || parsed.definitionTarget.trim() === '') {
      console.warn('AI did not generate definitionTarget. Response:', parsed)
      // Try to use definition as fallback if definitionTarget is missing
      if (parsed.definition && parsed.definition.trim()) {
        console.warn('Using definition as fallback for definitionTarget')
        parsed.definitionTarget = parsed.definition
      }
    }
      
    // Ensure definitionTarget exists, fallback to empty string if not provided
    const result: LookupResult = {
      ...parsed,
      phonetic: parsed.phonetic || undefined,
      definitionTarget: parsed.definitionTarget || '',
      definition: parsed.definition || '',
        isValidWord: parsed.isValidWord !== undefined ? parsed.isValidWord : true,
        suggestedWord: parsed.suggestedWord || undefined,
    }
      
      // Final check: Ensure the word in result matches what was searched
      // The word should always be exactly what was searched
      
      // Ensure definitionTarget is set
      if (!result.definitionTarget || result.definitionTarget.trim() === '') {
        result.definitionTarget = result.definition || ''
      }
      
    return result
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content)
    throw new Error('Failed to parse AI response')
  }
}

// Fetch definition from Wikipedia
export async function fetchWikipediaDefinition(
  word: string,
  targetLanguage: string
): Promise<{ definition: string; extract: string } | null> {
  try {
    // Map language codes to Wikipedia language codes
    const wikiLangMap: Record<string, string> = {
      en: 'en',
      es: 'es',
      zh: 'zh',
      hi: 'hi',
      ar: 'ar',
      pt: 'pt',
      bn: 'bn',
      ru: 'ru',
      ja: 'ja',
      fr: 'fr',
    }
    
    const wikiLang = wikiLangMap[targetLanguage] || 'en'
    
    // Try to fetch from Wikipedia API with timeout (important for China mainland)
    const apiUrl = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'DictionaryApp/1.0 (https://example.com)',
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      if (data.extract && data.extract.length > 0) {
        return {
          definition: data.extract.substring(0, 500), // Limit length
          extract: data.extract,
        }
      }
    }
  } catch (error) {
    console.log('Wikipedia fetch failed:', error)
  }
  
  return null
}

export async function generateImage(
  prompt: string,
  meaningContext?: string
): Promise<string> {
  // Use Unsplash API for image generation
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      // If meaning context is provided, use it to create a more specific search query
      let searchQuery = prompt.split(' - ')[0].split(',')[0].trim()
      
      if (meaningContext) {
        // Include the specific meaning in the search query for better image results
        // Extract key words from the meaning context
        const meaningWords = meaningContext
          .substring(0, 50)
          .split(/\s+/)
          .filter(w => w.length > 3)
          .slice(0, 3)
          .join(' ')
        searchQuery = `${searchQuery} ${meaningWords}`.trim()
      }
      
      const encodedQuery = encodeURIComponent(searchQuery)
      
      // Add timeout for Unsplash API (5 seconds) - important for China mainland
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodedQuery}&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
        {
          headers: {
            'Accept-Version': 'v1',
          },
          signal: controller.signal,
        }
      )
      clearTimeout(timeoutId)
      
      if (unsplashResponse.ok) {
        const data = await unsplashResponse.json()
        // Use regular size (good quality, reasonable size)
        if (data.urls?.regular) {
          console.log('Using Unsplash API image:', data.urls.regular)
          return data.urls.regular
        }
        // Fallback to small if regular not available
        if (data.urls?.small) {
          return data.urls.small
        }
      } else {
        const errorText = await unsplashResponse.text()
        console.log('Unsplash API error:', unsplashResponse.status, errorText)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Unsplash API timeout (5s) - using fallback')
      } else {
        console.log('Unsplash API failed:', error)
      }
    }
  }
  
  // Final fallback: Use Unsplash source (no API key, less reliable)
  // Add timeout for fallback too (important for China mainland)
  try {
    let unsplashQuery = prompt.substring(0, 50)
    if (meaningContext) {
      unsplashQuery = `${prompt.substring(0, 30)} ${meaningContext.substring(0, 20)}`
    }
    const fallbackController = new AbortController()
    const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 3000)
    
    // Try to fetch fallback image with timeout
    const fallbackResponse = await fetch(
      `https://source.unsplash.com/800x600/?${encodeURIComponent(unsplashQuery)}`,
      { signal: fallbackController.signal }
    )
    clearTimeout(fallbackTimeoutId)
    
    if (fallbackResponse.ok) {
      console.log('Using Unsplash fallback:', fallbackResponse.url)
      return fallbackResponse.url
    }
  } catch (error) {
    console.log('Unsplash fallback failed:', error)
  }
  
  // Ultimate fallback: return empty string (component will handle missing image)
  console.log('All image sources failed, returning empty string')
  return ''
}

export async function generateAudio(text: string, language: string): Promise<Buffer> {
  // Use OpenAI-compatible Edge-TTS service (free, uses Microsoft Edge TTS)
  try {
    // Map language codes to Edge-TTS voices (OpenAI-compatible voice names)
    const voiceMap: Record<string, string> = {
      en: 'alloy',    // OpenAI voice mapping
      es: 'nova',
      zh: 'alloy',    // For Chinese, you can also use: 'zh-CN-XiaoxiaoNeural'
      hi: 'nova',
      ar: 'echo',
      pt: 'nova',
      bn: 'echo',
      ru: 'echo',
      ja: 'alloy',    // For Japanese, you can also use: 'ja-JP-KeitaNeural'
      fr: 'nova',
    }

    const voice = voiceMap[language] || 'alloy'

    // Edge-TTS service configuration
    const edgeTtsBaseUrl = process.env.EDGE_TTS_API_URL || 'http://localhost:5050'
    const apiKey = process.env.EDGE_TTS_API_KEY || 'your_api_key_here'

    // Call Edge-TTS API (OpenAI-compatible endpoint)
    const response = await fetch(`${edgeTtsBaseUrl}/v1/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'tts-1', // Edge-TTS accepts this model name
      input: text,
        voice: voice,
        response_format: 'mp3', // Options: 'mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Edge-TTS API error: ${response.status} - ${errorText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    console.log('Edge-TTS audio generated successfully')
    return buffer
  } catch (error) {
    // TTS not available, return empty buffer
    // The frontend can use browser's Web Speech API as fallback
    console.log('Edge-TTS not available, using fallback:', error)
    return Buffer.from([])
  }
}

export async function generateStory(
  words: Array<{ word: string; definition: string; targetLanguage: string }>,
  nativeLanguage: string,
  targetLanguage?: string
): Promise<{ story: string; translation: string }> {
  // Use explicitly provided targetLanguage, or get from words, or default to 'en'
  const targetLang = targetLanguage || words[0]?.targetLanguage || 'en'
  const targetLangName = getLanguageName(targetLang)
  const nativeLangName = getLanguageName(nativeLanguage)

  const wordList = words.map(w => `- ${w.word}: ${w.definition}`).join('\n')

  const prompt = `You are a language learning assistant. The user wants to learn ${targetLangName}. Their native language is ${nativeLangName}.

CRITICAL LANGUAGE REQUIREMENTS - FOLLOW EXACTLY:
1. The "story" field MUST contain text written ONLY in ${targetLangName} language
2. The "translation" field MUST contain text written ONLY in ${nativeLangName} language
3. The translation is a translation FROM ${targetLangName} TO ${nativeLangName}
4. DO NOT write the story in ${nativeLangName}
5. DO NOT write the translation in ${targetLangName}
6. If ${targetLangName} is English and ${nativeLangName} is Chinese, the story is in English and translation is in Chinese
7. If ${targetLangName} is Spanish and ${nativeLangName} is Chinese, the story is in Spanish and translation is in Chinese

Example (if learning English, native Chinese):
- story: "Hello world. How are you?" (in English)
- translation: "你好世界。你好吗？" (in Chinese)

Create a fun, engaging, memorable short story (3-5 sentences) in ${targetLangName} using these words/phrases:

${wordList}

The story should be:
- Written entirely in ${targetLangName} language
- Natural and engaging
- Help the reader remember the vocabulary
- Appropriate for language learning
- 3-5 sentences long

The translation should be:
- Written entirely in ${nativeLangName} language
- A complete, accurate translation of the entire story
- Natural and fluent in ${nativeLangName}
- Translate FROM ${targetLangName} TO ${nativeLangName}

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "story": "The story written entirely in ${targetLangName}",
  "translation": "The complete translation written entirely in ${nativeLangName}"
}`

  const model = process.env.AI_MODEL || 'deepseek-ai/DeepSeek-V3' // Use DeepSeek-V3 for story generation
  
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a creative storyteller helping language learners. Always respond with valid JSON only, no markdown formatting.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    const result = JSON.parse(content) as { story: string; translation: string }
    return result
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content)
    throw new Error('Failed to parse AI response')
  }
}

function getLanguageName(code: string): string {
  const langMap: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    zh: 'Mandarin Chinese',
    hi: 'Hindi',
    ar: 'Arabic',
    pt: 'Portuguese',
    bn: 'Bengali',
    ru: 'Russian',
    ja: 'Japanese',
    fr: 'French',
  }
  return langMap[code] || code
}
