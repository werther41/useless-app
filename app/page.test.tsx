import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import "@testing-library/jest-dom"
import IndexPage from "./page"

// Path to the component

// Mock the API response
const mockApiResponse = {
  id: "test-id-1",
  text: "Test Fact from API",
  source: "Test Source",
  source_url: "https://example.com",
  language: "en",
  permalink: "https://example.com/fact/1",
}

// Mock fetch globally
global.fetch = jest.fn()

describe("IndexPage", () => {
  let mathRandomSpy: jest.SpyInstance

  beforeEach(() => {
    // Resetting mocks and spies before each test
    jest.clearAllMocks()
    // Mock Math.random to return a consistent value for rating generation
    mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5)
    // Mock fetch to return successful API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    })
  })

  afterEach(() => {
    // Restore original Math.random implementation
    if (mathRandomSpy) {
      mathRandomSpy.mockRestore()
    }
  })

  it("renders initial state correctly", () => {
    render(<IndexPage />)
    expect(screen.getByText("Useless Fact")).toBeInTheDocument()
    expect(
      screen.getByText("Ready to discover something completely useless?")
    ).toBeInTheDocument()
    expect(screen.queryByText("Rating:")).not.toBeInTheDocument()
    expect(screen.queryByText("Upvote")).not.toBeInTheDocument()
    expect(screen.queryByText("Downvote")).not.toBeInTheDocument()
  })

  it("generates a fact, displays its text, rating, and voting buttons", async () => {
    render(<IndexPage />)
    const generateButton = screen.getByText("Generate New Fact")
    fireEvent.click(generateButton)

    // Wait for the API call to complete and fact to be displayed
    await waitFor(() =>
      expect(screen.getByText(mockApiResponse.text)).toBeInTheDocument()
    )
    expect(screen.getByText("Source:")).toBeInTheDocument()
    expect(screen.getByText("Test Source")).toBeInTheDocument()
    expect(screen.getByText("Upvote")).toBeInTheDocument()
    expect(screen.getByText("Downvote")).toBeInTheDocument()
  })

  it("upvotes a fact and updates the rating", async () => {
    render(<IndexPage />)
    fireEvent.click(screen.getByText("Generate New Fact"))
    await waitFor(() =>
      expect(screen.getByText(mockApiResponse.text)).toBeInTheDocument()
    )

    const upvoteButton = screen.getByText("Upvote")
    fireEvent.click(upvoteButton)
    // With Math.random mocked to 0.5, the rating should be 0, so after upvote it should be 1
    expect(screen.getByText("Rating: 1")).toBeInTheDocument()
  })

  it("downvotes a fact and updates the rating", async () => {
    render(<IndexPage />)
    fireEvent.click(screen.getByText("Generate New Fact"))
    await waitFor(() =>
      expect(screen.getByText(mockApiResponse.text)).toBeInTheDocument()
    )

    const downvoteButton = screen.getByText("Downvote")
    fireEvent.click(downvoteButton)
    // With Math.random mocked to 0.5, the rating should be 0, so after downvote it should be -1
    expect(screen.getByText("Rating: -1")).toBeInTheDocument()
  })

  it("correctly handles multiple upvotes and downvotes", async () => {
    render(<IndexPage />)
    fireEvent.click(screen.getByText("Generate New Fact"))
    await waitFor(() =>
      expect(screen.getByText(mockApiResponse.text)).toBeInTheDocument()
    )

    const initialRating = 0 // With Math.random mocked to 0.5, rating should be 0

    const upvoteButton = screen.getByText("Upvote")
    const downvoteButton = screen.getByText("Downvote")

    // Upvote twice
    fireEvent.click(upvoteButton) // Rating: 1
    fireEvent.click(upvoteButton) // Rating: 2
    expect(screen.getByText(`Rating: ${initialRating + 2}`)).toBeInTheDocument()

    // Downvote once
    fireEvent.click(downvoteButton) // Rating: 1
    expect(screen.getByText(`Rating: ${initialRating + 1}`)).toBeInTheDocument()

    // Downvote again
    fireEvent.click(downvoteButton) // Rating: 0
    expect(screen.getByText(`Rating: ${initialRating}`)).toBeInTheDocument()
  })

  it("displays the correct rating for a fact and allows voting", async () => {
    // Mock Math.random to return 0.8 to get a rating of 3 (Math.floor(0.8 * 11) - 5 = 3)
    mathRandomSpy.mockReturnValue(0.8)

    render(<IndexPage />)
    fireEvent.click(screen.getByText("Generate New Fact"))

    await waitFor(() =>
      expect(screen.getByText(mockApiResponse.text)).toBeInTheDocument()
    )
    expect(screen.getByText("Rating: 3")).toBeInTheDocument()

    const upvoteButton = screen.getByText("Upvote")
    fireEvent.click(upvoteButton)
    expect(screen.getByText("Rating: 4")).toBeInTheDocument()

    const downvoteButton = screen.getByText("Downvote")
    fireEvent.click(downvoteButton) // Back to 3
    fireEvent.click(downvoteButton) // Down to 2
    expect(screen.getByText("Rating: 2")).toBeInTheDocument()
  })

  it("shows loading state when generating a fact", async () => {
    render(<IndexPage />)
    const generateButton = screen.getByText("Generate New Fact")
    fireEvent.click(generateButton)

    // Should show loading state
    expect(screen.getByText("Generating...")).toBeInTheDocument()

    // Wait for loading to complete
    await waitFor(() =>
      expect(screen.getByText(mockApiResponse.text)).toBeInTheDocument()
    )
  })

  it("handles API error gracefully", async () => {
    // Mock fetch to return an error
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"))

    render(<IndexPage />)
    fireEvent.click(screen.getByText("Generate New Fact"))

    // Should show fallback fact
    await waitFor(() =>
      expect(
        screen.getByText(/The API is currently unavailable/)
      ).toBeInTheDocument()
    )
  })
})
