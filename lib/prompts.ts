// // --- FEW-SHOT PROMPTS ---

// export const SYSTEM_PROMPT = `
// You are an assistant that creates short, quirky, and 'useless' fun facts from news articles. The fact should be surprising and tangentially related to the main point of the article. Do not state the obvious. Output only the fact itself.

// Here is an example of how to do it correctly:

// ---
// ARTICLE:
// Title: "Tech Giant Unveils New Quantum Chip, 20% Faster Than Previous Models"
// Content: "Today, InnovateCorp announced its new 'Pulsar' quantum chip..."

// YOUR OUTPUT:
// The silicon used in computer chips must be 99.9999999% pure, a standard known as "nine-nines" purity.
// ---
// `

// export function createUserPrompt(
//   articleTitle: string,
//   articleContent: string
// ): string {
//   return `Here is the article: "${articleTitle}\n\n${articleContent}". Please generate a fun fact.`
// }

// --- CHAIN-OF-THOUGHT & JSON PROMPTS ---

/**
 * Tone presets for fact generation
 */
export const TONE_PRESETS = {
  deadpan:
    "Write in a completely flat, emotionless manner. State facts matter-of-factly without any enthusiasm or humor.",
  sarcastic:
    "Use dry wit and ironic humor. Make subtle, witty observations that are amusing but not mean-spirited.",
  nerdy:
    "Use technical details and enthusiastic academic language. Show genuine excitement about the subject matter.",
  enthusiast:
    "Be excited and passionate about the subject. Use energetic, positive language that conveys genuine interest.",
  conspiratorial:
    "Hint at hidden meanings and connections. Suggest there might be more to the story, but keep it playful.",
  snarky:
    "Use sharp, witty, slightly mocking commentary. Be clever and sardonic, but keep it light-hearted.",
  philosophical:
    "Frame facts in broader existential or abstract terms. Connect the fact to deeper questions about life or meaning.",
} as const

export type TonePreset = keyof typeof TONE_PRESETS

/**
 * Build system prompt with optional tone instructions
 */
export function buildSystemPrompt(tone?: TonePreset | null): string {
  const basePrompt = `
You are an assistant that extracts a single, short, and quirky 'useless' fun fact from a news article.

First, think step-by-step to identify the best fact:
1.  **Main Subject:** Briefly identify the core subject of the article.
2.  **Tangential Topics:** Brainstorm 2-3 related but obscure topics. For example, if the article is about a new car, tangential topics could be the history of rubber tires or the origin of the term 'dashboard'.
3.  **Select Best Fact:** Choose the most surprising and interesting tangential topic and formulate it as a fun fact.

The fact should be approximately 25 words long. Make it surprising and tangentially related to the main point of the article. Do not state the obvious.

Finally, format your response as a single JSON object. Do not output any other text.

Example JSON output format:
{
  "funFact": "The silicon used in computer chips must be 99.9999999% pure, a standard known as 'nine-nines' purity.",
  "whyInteresting": "This extreme precision requirement highlights the delicate balance between industrial manufacturing and atomic-level perfection.",
  "sourceSnippet": "The new chip manufacturing process requires unprecedented levels of material purity, with silicon reaching 99.9999999% purity standards."
}
`

  if (tone && TONE_PRESETS[tone]) {
    return `${basePrompt.trim()}\n\n**Writing Tone:** ${
      TONE_PRESETS[tone]
    } Apply this tone to both the funFact and whyInteresting fields.`
  }

  return basePrompt.trim()
}

/**
 * Default system prompt (no tone)
 */
export const SYSTEM_PROMPT = buildSystemPrompt()

/**
 * Create user prompt with article content and optional topics
 */
export function createUserPrompt(
  articleTitle: string,
  articleContent: string,
  matchedTopics?: string[],
  isRegenerate: boolean = false
): string {
  let prompt = `Analyze the following article and generate a fun fact based on the rules.`

  if (matchedTopics && matchedTopics.length > 0) {
    prompt += ` Focus on these topics: ${matchedTopics.join(", ")}.`
  }

  if (isRegenerate) {
    prompt += ` Generate a different fact from a different angle about this article.`
  }

  prompt += `\n\nArticle: "${articleTitle}\n\n${articleContent}"`

  return prompt
}

// --- TOPIC EXTRACTION PROMPTS ---

/**
 * Build the entity extraction prompt for Gemini
 */
export function buildEntityExtractionPrompt(
  title: string,
  content: string
): string {
  return `You are an expert NLP system. Your task is to extract the 5-10 most important named entities and key concepts from the following news article.

Focus on identifying specific and relevant items. Use the following entity types:
- **PERSON**: People, scientists, researchers.
- **ORG**: Organizations, companies, institutions (e.g., "NASA", "Google").
- **LOCATION**: Geographical places, countries, cities.
- **PRODUCT**: Specific software, hardware, or services (e.g., "iPhone 17", "GitHub Copilot").
- **PROGRAMMING_LANGUAGE**: Programming languages (e.g., "Python", "Rust").
- **SCIENTIFIC_TERM**: Specific scientific concepts, theories, species, or astronomical bodies (e.g., "black hole", "CRISPR").
- **FIELD_OF_STUDY**: Broader domains of knowledge (e.g., "Machine Learning", "Astrophysics").
- **EVENT**: Specific named events, conferences, or historical periods (e.g., "WWDC 2025", "The Renaissance").
- **WORK_OF_ART**: Named creative works like books, films, or paintings.
- **LAW_OR_POLICY**: Named laws, regulations, or policies (e.g., "GDPR").

**Article to Analyze:**
Title: ${title}
Content: ${content}

**Instructions:**
1.  Analyze the title and content to find the most significant topics.
2.  Do not extract generic or overly broad terms (e.g., "science", "research").
3.  Return **ONLY** a raw JSON array with the specified format. Do not add any introductory text, explanations, or markdown formatting like \`\`\`json.

**JSON Output Format:**
[
  {"text": "entity name", "type": "TYPE_FROM_LIST_ABOVE"},
  {"text": "another entity", "type": "TYPE_FROM_LIST_ABOVE"}
]`
}

/**
 * Entity types supported by the system
 */
export const SUPPORTED_ENTITY_TYPES = [
  "PERSON",
  "ORG",
  "LOCATION",
  "PRODUCT",
  "PROGRAMMING_LANGUAGE",
  "SCIENTIFIC_TERM",
  "FIELD_OF_STUDY",
  "EVENT",
  "WORK_OF_ART",
  "LAW_OR_POLICY",
] as const

/**
 * Legacy entity types for backward compatibility
 */
export const LEGACY_ENTITY_TYPES = ["TECH", "CONCEPT", "OTHER"] as const

/**
 * All supported entity types (new + legacy)
 */
export const ALL_ENTITY_TYPES = [
  ...SUPPORTED_ENTITY_TYPES,
  ...LEGACY_ENTITY_TYPES,
] as const

export type SupportedEntityType = (typeof SUPPORTED_ENTITY_TYPES)[number]
export type LegacyEntityType = (typeof LEGACY_ENTITY_TYPES)[number]
export type EntityType = (typeof ALL_ENTITY_TYPES)[number]
