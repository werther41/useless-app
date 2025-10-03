import { rehype } from "rehype"
import rehypeKatex from "rehype-katex"
import { remark } from "remark"
import remarkGfm from "remark-gfm"
import html from "remark-html"
import remarkMath from "remark-math"

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(html)
    .process(markdown)

  const htmlResult = await rehype()
    .data("settings", { fragment: true })
    .use(rehypeKatex)
    .process(result.toString())

  return htmlResult.toString()
}
