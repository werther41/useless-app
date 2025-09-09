"use client"

import { useState } from "react"
import {
  BookOpen,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Wand2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import factsData from "../data/fun-facts.json"

interface Fact {
  id: number
  text: string
  rating: number
}

export default function UselessFactsHome() {
  const [currentFact, setCurrentFact] = useState<Fact | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  const generateNewFact = () => {
    const randomFact = factsData[Math.floor(Math.random() * factsData.length)]
    setCurrentFact(randomFact)
    setHasVoted(false)
  }

  const handleVote = (vote: "up" | "down") => {
    if (!currentFact || hasVoted) return

    const factIndex = factsData.findIndex((fact) => fact.id === currentFact.id)
    if (factIndex !== -1) {
      factsData[factIndex].rating += vote === "up" ? 1 : -1
      const updatedFact = { ...factsData[factIndex] }
      setCurrentFact(updatedFact)
      setHasVoted(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  U
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Useless Facts
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Quick Facts
              </a>
              <a
                href="#infographics"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Infographics
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="w-8 h-8 text-primary" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Completely Useless Knowledge
            </Badge>
          </div>
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Discover Facts You'll Never Need
          </h2>
          <p className="text-xl text-muted-foreground mb-12 text-pretty">
            Expand your mind with wonderfully pointless information that's
            guaranteed to impress absolutely no one.
          </p>
        </div>
      </section>

      {/* Main Fact Display */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mb-8">
                  <Button
                    onClick={generateNewFact}
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg"
                  >
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate New Fact
                  </Button>
                </div>

                <div className="min-h-[120px] flex items-center justify-center mb-8">
                  {currentFact ? (
                    <h3 className="text-3xl font-bold text-foreground text-balance leading-relaxed">
                      {currentFact.text}
                    </h3>
                  ) : (
                    <h3 className="text-3xl font-bold text-foreground text-balance leading-relaxed">
                      Ready to discover something completely useless?
                    </h3>
                  )}
                </div>

                {currentFact && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-semibold text-lg">
                        {currentFact.rating}
                      </span>
                      {currentFact.rating > 0 && (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => handleVote("up")}
                        disabled={hasVoted}
                        variant={hasVoted ? "secondary" : "default"}
                        size="lg"
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:bg-muted disabled:text-muted-foreground"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        Useful Uselessness
                      </Button>
                      <Button
                        onClick={() => handleVote("down")}
                        disabled={hasVoted}
                        variant="outline"
                        size="lg"
                        className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:border-muted disabled:text-muted-foreground disabled:hover:bg-muted disabled:hover:text-muted-foreground"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        Too Useless
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Infographics Preview Section */}
      <section id="infographics" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-foreground mb-4">
              Deep Dive Infographics
            </h3>
            <p className="text-xl text-muted-foreground text-pretty">
              Explore complex useless topics with beautiful, detailed
              infographics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Infographic Cards */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  Should You Flip Your Burger?
                </h4>
                <p className="text-muted-foreground text-sm">
                  A comprehensive analysis of burger flipping techniques and
                  their impact on taste.
                </p>
                <Badge variant="outline" className="mt-3">
                  Coming Soon
                </Badge>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-accent" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  The Science of Sock Pairing
                </h4>
                <p className="text-muted-foreground text-sm">
                  Mathematical models for optimal sock matching strategies in
                  your drawer.
                </p>
                <Badge variant="outline" className="mt-3">
                  Coming Soon
                </Badge>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">
                  Optimal Cereal-to-Milk Ratios
                </h4>
                <p className="text-muted-foreground text-sm">
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

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">
            © 2024 Useless Facts. Making the world slightly more informed about
            completely irrelevant things.
          </p>
        </div>
      </footer>
    </div>
  )
}
