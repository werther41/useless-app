import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BackButton from "@/components/back-button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <Card className="border-primary/20 from-primary/5 to-secondary/5 bg-gradient-to-br">
          <CardHeader className="text-center">
            <div className="from-primary/20 to-secondary/20 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br">
              <div className="text-4xl">🤔</div>
            </div>
            <CardTitle className="text-4xl font-bold text-foreground">
              404 - Oops! 🚀
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-xl text-muted-foreground">
                Looks like this page went on a coffee break! ☕
              </p>
              <p className="text-sm text-muted-foreground">
                Don&apos;t worry, even the most useless facts need a rest
                sometimes! 😄
              </p>
              <div className="flex justify-center gap-2 text-2xl">
                <span>🔍</span>
                <span>📄</span>
                <span>❌</span>
                <span>🤷‍♂️</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                variant="default"
                className="bg-gradient-to-r from-primary to-secondary"
              >
                <Link href="/" className="flex items-center gap-2">
                  🏠 Take Me Home
                </Link>
              </Button>

              <BackButton />
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-sm text-muted-foreground">
                While you&apos;re here, check out these amazing pages! ✨
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/facts" className="flex items-center gap-1">
                    🧠 All Facts
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/statistics" className="flex items-center gap-1">
                    📊 Statistics
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/blog" className="flex items-center gap-1">
                    📝 Blog
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/deep-dive" className="flex items-center gap-1">
                    🔬 Deep Dives
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl">💡</span> Fun fact: This 404 page is
                probably more useful than half the facts on our site! 😂
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Still lost in the digital void? 🆘{" "}
            <Link
              href="/"
              className="hover:text-primary/80 text-primary underline underline-offset-4"
            >
              Send us a distress signal
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
