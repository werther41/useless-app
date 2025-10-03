import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface DeepDiveSectionProps {
  title?: string
  subtitle?: string
  sectionId?: string
}

export function DeepDiveSection({
  title = "Deep Dive Infographics",
  subtitle = "Explore complex useless topics with beautiful, detailed infographics",
  sectionId,
}: DeepDiveSectionProps) {
  return (
    <section id={sectionId} className="bg-muted/30 px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h3 className="mb-4 text-4xl font-bold text-foreground">{title}</h3>
          <p className="text-pretty text-xl text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Sample Infographic Cards */}
          <Link href="/deep-dive/burger-infographic">
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="from-primary/20 to-accent/20 mb-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br">
                  <span className="text-6xl">🍔</span>
                </div>
                <h4 className="mb-2 text-xl font-semibold">
                  Should You Flip Your Burger?
                </h4>
                <p className="text-sm text-muted-foreground">
                  A comprehensive analysis of burger flipping techniques and
                  their impact on taste.
                </p>
                <Badge variant="default" className="mt-3">
                  Available Now
                </Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/deep-dive/sock-pairing-mathematics">
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="from-accent/20 to-primary/20 mb-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br">
                  <span className="text-6xl">🧦</span>
                </div>
                <h4 className="mb-2 text-xl font-semibold">
                  The Science of Sock Pairing
                </h4>
                <p className="text-sm text-muted-foreground">
                  Mathematical models for optimal sock matching strategies in
                  your drawer.
                </p>
                <Badge variant="default" className="mt-3">
                  Available Now
                </Badge>
              </CardContent>
            </Card>
          </Link>

          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="from-primary/20 to-accent/20 mb-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br">
                <span className="text-6xl">🥣</span>
              </div>
              <h4 className="mb-2 text-xl font-semibold">
                Optimal Cereal-to-Milk Ratios
              </h4>
              <p className="text-sm text-muted-foreground">
                A data-driven approach to achieving breakfast perfection.
              </p>
              <Badge variant="outline" className="mt-3">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
