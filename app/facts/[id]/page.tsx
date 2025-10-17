import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getFactById } from "@/lib/facts"
import { FactPageClient } from "@/components/fact-page-client"

interface FactPageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: FactPageProps): Promise<Metadata> {
  const fact = await getFactById(params.id)

  if (!fact) {
    return {
      title: "Fact Not Found",
    }
  }

  const title = `Useless Fact: ${fact.text.slice(0, 60)}${
    fact.text.length > 60 ? "..." : ""
  }`
  const description = fact.text

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/facts/${params.id}`,
      siteName: "Useless Facts",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default async function FactPage({ params }: FactPageProps) {
  const fact = await getFactById(params.id)

  if (!fact) {
    notFound()
  }

  return <FactPageClient fact={fact} />
}
