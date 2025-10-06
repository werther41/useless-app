import BottomRatedFactsSection from "@/components/bottom-rated-facts-section"
import FactStatsSection from "@/components/fact-stats-section"
import { Footer } from "@/components/footer"
import TopRatedFactsSection from "@/components/top-rated-facts-section"

// Force dynamic rendering for this page
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-foreground">
            Fun Fact Statistics & Rankings
          </h1>
          <p className="text-pretty text-xl text-muted-foreground">
            Explore comprehensive statistics about our useless facts and
            discover the most loved and hated entries in our collection.
          </p>
        </div>
      </section>

      {/* Fun Fact Statistics */}
      <FactStatsSection />

      {/* Top Rated Facts */}
      <TopRatedFactsSection />

      {/* Bottom Rated Facts */}
      <BottomRatedFactsSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
