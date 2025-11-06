"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Upload, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ImportResults {
  success: boolean
  message: string
  results: {
    imported: number
    skipped: number
    errors: number
    errors_list: string[]
  }
}

export default function ImportPage() {
  const [jsonInput, setJsonInput] = useState("")
  const [results, setResults] = useState<ImportResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  const exampleJson = `[
  {
    "id": "fact-6",
    "text": "The human brain contains approximately 86 billion neurons.",
    "source": "Neuroscience Facts",
    "source_url": "https://example.com"
  },
  {
    "id": "fact-7",
    "text": "A group of owls is called a 'parliament'.",
    "source": "Animal Facts",
    "source_url": "https://example.com"
  },
  {
    "id": "fact-8",
    "text": "The Great Wall of China is not visible from space with the naked eye.",
    "source": "Space Facts",
    "source_url": "https://example.com"
  }
]`

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      setResults({
        success: false,
        message: "Please enter some JSON data",
        results: {
          imported: 0,
          skipped: 0,
          errors: 1,
          errors_list: ["No data provided"],
        },
      })
      return
    }

    setIsLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/facts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facts: JSON.parse(jsonInput),
          skipDuplicates,
        }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        success: false,
        message: "Import failed",
        results: {
          imported: 0,
          skipped: 0,
          errors: 1,
          errors_list: [
            `Network error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          ],
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadExample = () => {
    setJsonInput(exampleJson)
  }

  const clearInput = () => {
    setJsonInput("")
    setResults(null)
  }

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Admin: Import Facts</h1>
        <p className="text-muted-foreground">
          Import new facts into the database using JSON format
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Facts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded"
                />
                Skip duplicates
              </label>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">
                  JSON Facts (array format):
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadExample}
                    disabled={isLoading}
                  >
                    Load Example
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearInput}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="h-80 w-full resize-none rounded-md border p-3 font-mono text-sm"
                placeholder={`[
  {
    "id": "fact-6",
    "text": "Your new fact here",
    "source": "Source Name",
    "source_url": "https://example.com"
  }
]`}
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleImport}
              disabled={isLoading || !jsonInput.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Importing..." : "Import Facts"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results ? (
                results.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="mb-2 font-medium">{results.message}</p>

                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.results.imported}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Imported
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {results.results.skipped}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Skipped
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {results.results.errors}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Errors
                      </div>
                    </div>
                  </div>

                  {results.results.errors_list.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium text-red-600">Errors:</h4>
                      <div className="space-y-1">
                        {results.results.errors_list.map((error, index) => (
                          <div
                            key={index}
                            className="rounded bg-red-50 p-2 text-sm text-red-600"
                          >
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Duplicates are skipped when &quot;Skip
                  duplicates&quot; is enabled. Each fact must have a unique ID.
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <AlertCircle className="size-12 mx-auto mb-4 opacity-50" />
                <p>Import results will appear here after running an import.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">JSON Format Requirements:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  <code>id</code> - Unique identifier (required)
                </li>
                <li>
                  <code>text</code> - The fact text (required, min 10
                  characters)
                </li>
                <li>
                  <code>source</code> - Source name (optional)
                </li>
                <li>
                  <code>source_url</code> - Source URL (optional, must be valid
                  URL)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Tips:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>
                  Use descriptive IDs like &quot;fact-6&quot;,
                  &quot;animal-1&quot;, &quot;science-2&quot;
                </li>
                <li>Keep fact text concise but informative</li>
                <li>Include source information when available</li>
                <li>Test with a small batch first</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
