import Link from "next/link"
import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DeepDiveSection } from "@/components/deep-dive-section"
import { Footer } from "@/components/footer"
import { RealTimeFactSection } from "@/components/real-time-fact-section"
import { StaticFactSection } from "@/components/static-fact-section"

export default function UselessFactsHome() {
  return (
    <div>
      {/* Hero Section */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Star className="h-8 w-8 text-primary" />
            <Badge variant={"outline"} className="px-4 py-2 text-lg">
              Completely Useless Knowledge
            </Badge>
          </div>
          <h2 className="text-balance mb-6 text-3xl font-semibold text-foreground">
            Discover Facts You&apos;ll Never Need
          </h2>
          <p className="text-pretty mb-12 text-xl text-muted-foreground">
            Expand your mind with wonderfully pointless information that&apos;s
            guaranteed to impress absolutely no one.
          </p>
        </div>
      </section>

      {/* Main Fact Display */}
      <StaticFactSection />

      {/* Statistics Link Section */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-pretty text-lg text-muted-foreground">
            Want to see how our useless facts are performing? Check out our{" "}
            <Link
              href="/statistics"
              className="hover:text-primary/80 text-primary underline underline-offset-4 transition-colors"
            >
              comprehensive statistics and rankings
            </Link>{" "}
            to discover the most loved and hated facts in our collection.
          </p>
          <p className="text-pretty mt-6 text-lg text-muted-foreground">
            Prefer to browse everything yourself? Explore our full catalog on
            the{" "}
            <Link
              href="/facts"
              className="hover:text-primary/80 text-primary underline underline-offset-4 transition-colors"
            >
              All Facts
            </Link>{" "}
            page.
          </p>
        </div>
      </section>

      {/* Real-Time News Facts Section */}
      <RealTimeFactSection />

      {/* Infographics Preview Section */}
      <DeepDiveSection sectionId="infographics" />

      {/* Footer */}
      <Footer />
    </div>
  )
}
