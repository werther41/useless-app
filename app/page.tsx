"use client"

import React, { useState } from "react"

// import { siteConfig } from "@/config/site" // This import seems unused, commenting out for now.
import { Button } from "@/components/ui/button"
import factsData from "../data/fun-facts.json"

interface Fact {
  id: number
  text: string
  rating: number
}

export default function IndexPage() {
  const [currentFact, setCurrentFact] = useState<Fact | null>(null)

  const generateFact = () => {
    const randomFactObject =
      factsData[Math.floor(Math.random() * factsData.length)]
    setCurrentFact(randomFactObject)
  }

  const handleUpvote = () => {
    if (!currentFact) return;

    const factIndex = factsData.findIndex(fact => fact.id === currentFact.id);

    if (factIndex !== -1) {
      factsData[factIndex].rating += 1;
      const updatedFact = { ...factsData[factIndex] };
      setCurrentFact(updatedFact);
    } else {
      console.error("Fact not found in factsData for upvoting");
    }
  };

  const handleDownvote = () => {
    if (!currentFact) return;

    const factIndex = factsData.findIndex(fact => fact.id === currentFact.id);

    if (factIndex !== -1) {
      factsData[factIndex].rating -= 1;
      const updatedFact = { ...factsData[factIndex] };
      setCurrentFact(updatedFact);
    } else {
      console.error("Fact not found in factsData for downvoting");
    }
  };

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Useless Fact
        </h1>
        {currentFact ? (
          <>
            <p className="max-w-[700px] text-lg">{currentFact.text}</p>
            <p className="max-w-[700px] text-md">Rating: {currentFact.rating}</p>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleUpvote}>Upvote</Button>
              <Button onClick={handleDownvote} variant="outline">Downvote</Button>
            </div>
          </>
        ) : (
          <p className="max-w-[700px] text-lg">
            Click the button to see a fun fact!
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={generateFact}>Generate Fact</Button>
      </div>
    </section>
  )
}
