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

export const SYSTEM_PROMPT = `
You are an assistant that extracts a single, short, and quirky 'useless' fun fact from a news article.

First, think step-by-step to identify the best fact:
1.  **Main Subject:** Briefly identify the core subject of the article.
2.  **Tangential Topics:** Brainstorm 2-3 related but obscure topics. For example, if the article is about a new car, tangential topics could be the history of rubber tires or the origin of the term 'dashboard'.
3.  **Select Best Fact:** Choose the most surprising and interesting tangential topic and formulate it as a fun fact.

Finally, format your response as a single JSON object. Do not output any other text.

Example JSON output format:
{
  "funFact": "The silicon used in computer chips must be 99.9999999% pure, a standard known as 'nine-nines' purity."
}
`

export function createUserPrompt(
  articleTitle: string,
  articleContent: string
): string {
  return `Analyze the following article and generate a fun fact based on the rules. Article: "${articleTitle}\n\n${articleContent}"`
}
