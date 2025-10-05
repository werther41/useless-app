import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini for embeddings
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

/**
 * Generate embedding for text using Gemini text-embedding-004 model
 * @param text - The text to generate embedding for
 * @returns Promise<number[]> - Array of float32 values representing the embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable not set")
    }

    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const result = await model.embedContent(text)

    return result.embedding.values
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw new Error(
      `Failed to generate embedding: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

/**
 * Generate embedding for a news article (title + content)
 * @param title - Article title
 * @param content - Article content
 * @returns Promise<number[]> - Array of float32 values representing the embedding
 */
export async function generateArticleEmbedding(
  title: string,
  content: string
): Promise<number[]> {
  // Combine title and content for better context
  const combinedText = `${title}\n\n${content}`
  return generateEmbedding(combinedText)
}
