"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  LogarithmicScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const chartTooltipTitleCallback = {
  plugins: {
    tooltip: {
      callbacks: {
        title: function (tooltipItems: any) {
          const item = tooltipItems[0]
          let label = item.chart.data.labels[item.dataIndex]
          if (Array.isArray(label)) {
            return label.join(" ")
          } else {
            return label
          }
        },
      },
    },
  },
}

const wrapLabels = (label: string) => {
  if (typeof label === "string" && label.length > 16) {
    const words = label.split(" ")
    const lines = []
    let currentLine = ""
    words.forEach((word: string) => {
      if ((currentLine + word).length > 16) {
        lines.push(currentLine.trim())
        currentLine = ""
      }
      currentLine += word + " "
    })
    lines.push(currentLine.trim())
    return lines
  }
  return label
}

export default function SockPairingMathematics() {
  const [sockPairs, setSockPairs] = useState(25)
  const [pigeonholeInput, setPigeonholeInput] = useState(10)
  const [pigeonholeResult, setPigeonholeResult] = useState(11)

  const calculateEfficiency = (pairs: number) => {
    const n = pairs * 2
    const randomGrab = n * n
    const singlePass = n * 2
    const categoricalSort = n * Math.log(n)
    return [randomGrab, singlePass, categoricalSort]
  }

  const efficiencyData = {
    labels: ["Random Grab", "Single Pass", "Categorical Sort"].map(wrapLabels),
    datasets: [
      {
        label: "Relative Steps to Complete",
        data: calculateEfficiency(sockPairs),
        backgroundColor: ["#F97316", "#3B82F6", "#10B981"],
        borderRadius: 4,
      },
    ],
  }

  const probabilityData = {
    labels: [
      "100 socks left",
      "80 socks left",
      "60 socks left",
      "40 socks left",
      "20 socks left",
      "10 socks left",
    ],
    datasets: [
      {
        label: "Probability of Next Pick Being a Match",
        data: [0.01, 0.012, 0.016, 0.025, 0.05, 0.1],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const handlePigeonholeCalculate = () => {
    setPigeonholeResult(pigeonholeInput + 1)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur-md">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">
            The Science of Sock Pairing
          </h1>
          <div className="hidden space-x-8 md:flex">
            <a
              href="#problem"
              className="border-b-2 border-transparent pb-1 font-medium transition-colors hover:border-blue-600 hover:text-blue-600"
            >
              The Problem
            </a>
            <a
              href="#strategies"
              className="border-b-2 border-transparent pb-1 font-medium transition-colors hover:border-blue-600 hover:text-blue-600"
            >
              Strategies
            </a>
            <a
              href="#lab"
              className="border-b-2 border-transparent pb-1 font-medium transition-colors hover:border-blue-600 hover:text-blue-600"
            >
              Efficiency Lab
            </a>
            <a
              href="#math"
              className="border-b-2 border-transparent pb-1 font-medium transition-colors hover:border-blue-600 hover:text-blue-600"
            >
              The Math
            </a>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-8 md:py-12">
        {/* Introduction */}
        <section id="intro" className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            Mathematical Models for Your Laundry Pile
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600">
            Ever faced a mountain of clean laundry and despaired at the chaos of
            unpaired socks? This is a surprisingly common problem of probability
            and computational complexity. This report explores mathematical
            models to find the most efficient sock matching strategies.
          </p>
        </section>

        {/* Problem Definition */}
        <section id="problem" className="mb-16">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Defining the Sock Drawer Problem
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg text-slate-600">
            To analyze the problem, we first need to define our variables. A
            typical laundry load can be modeled with a few key numbers that
            determine the complexity of the pairing task.
          </p>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-slate-500">
                P (Number of Pairs)
              </h3>
              <p className="text-4xl font-bold text-blue-600">50</p>
              <p className="mt-2 text-sm text-slate-500">
                The number of unique sock pairs in the pile.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-slate-500">
                N (Total Socks)
              </h3>
              <p className="text-4xl font-bold text-blue-600">103</p>
              <p className="mt-2 text-sm text-slate-500">
                The total count of individual socks (2 * P + U).
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-slate-500">
                U (Unmatched Odds)
              </h3>
              <p className="text-4xl font-bold text-orange-500">3</p>
              <p className="mt-2 text-sm text-slate-500">
                The tragic single socks whose mates are lost forever.
              </p>
            </div>
          </div>
        </section>

        {/* Strategies */}
        <section id="strategies" className="mb-16">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Sock Pairing Strategies
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg text-slate-600">
            There are several common approaches to sock pairing, each with
            different mathematical efficiencies. Click on a strategy to see its
            pros and cons.
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h3 className="mb-2 text-xl font-semibold text-blue-700">
                1. Random Grab
              </h3>
              <p className="text-slate-600">
                Pick one sock, then rummage through the entire pile for its
                match. Repeat until all socks are paired.
              </p>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-800">Analysis:</h4>
                <ul className="mt-2 list-inside list-disc text-slate-600">
                  <li>
                    <strong>Pro:</strong> Requires no setup or surface space.
                  </li>
                  <li>
                    <strong>Con:</strong> Highly inefficient. The search time
                    increases quadratically with the number of socks.
                  </li>
                  <li>
                    <strong>Complexity:</strong> O(n²)
                  </li>
                </ul>
              </div>
            </div>
            <div className="cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h3 className="mb-2 text-xl font-semibold text-blue-700">
                2. Single Pass
              </h3>
              <p className="text-slate-600">
                Lay out all socks on a surface. Pick up one sock and visually
                scan the array of laid-out socks to find its mate.
              </p>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-800">Analysis:</h4>
                <ul className="mt-2 list-inside list-disc text-slate-600">
                  <li>
                    <strong>Pro:</strong> Much faster than random grabbing.
                  </li>
                  <li>
                    <strong>Con:</strong> Requires a large flat surface area.
                  </li>
                  <li>
                    <strong>Complexity:</strong> O(n)
                  </li>
                </ul>
              </div>
            </div>
            <div className="cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h3 className="mb-2 text-xl font-semibold text-blue-700">
                3. Categorical Sort
              </h3>
              <p className="text-slate-600">
                First, sort all socks into piles based on color/pattern. Then,
                pair the socks within each smaller, manageable pile.
              </p>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-800">Analysis:</h4>
                <ul className="mt-2 list-inside list-disc text-slate-600">
                  <li>
                    <strong>Pro:</strong> The most efficient method for large
                    numbers of socks.
                  </li>
                  <li>
                    <strong>Con:</strong> Requires some initial sorting effort.
                  </li>
                  <li>
                    <strong>Complexity:</strong> O(n log n)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Efficiency Lab */}
        <section id="lab" className="mb-16">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            Interactive Efficiency Lab
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg text-slate-600">
            How do these strategies compare as your sock collection grows? Use
            the slider below to adjust the number of sock pairs and see how the
            theoretical number of &quot;steps&quot; (comparisons) changes for
            each strategy.
          </p>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-6 flex flex-col items-center justify-center gap-4 md:flex-row">
              <label htmlFor="sockPairs" className="font-medium text-slate-700">
                Number of Sock Pairs:
              </label>
              <input
                type="range"
                id="sockPairs"
                min="5"
                max="100"
                value={sockPairs}
                onChange={(e) => setSockPairs(parseInt(e.target.value))}
                className="w-full max-w-xs cursor-pointer"
              />
              <span className="w-16 text-center text-2xl font-bold text-blue-600">
                {sockPairs}
              </span>
            </div>
            <div className="h-96">
              <Bar
                data={efficiencyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    ...chartTooltipTitleCallback.plugins,
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      type: "logarithmic",
                      grid: { color: "#E2E8F0" },
                      ticks: { color: "#64748B" },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: "#64748B" },
                    },
                  },
                }}
              />
            </div>
          </div>
        </section>

        {/* Math Corner */}
        <section id="math" className="mb-16">
          <h2 className="mb-4 text-center text-3xl font-bold text-slate-900">
            The Math Corner
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg text-slate-600">
            Two key mathematical principles govern the world of sock pairing:
            the Pigeonhole Principle and basic probability.
          </p>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-center text-xl font-semibold">
                Guaranteed Pair Calculator
              </h3>
              <p className="mb-4 text-center text-slate-600">
                The{" "}
                <span className="font-medium text-blue-600">
                  Pigeonhole Principle
                </span>{" "}
                states that if you have &apos;P&apos; pairs (pigeonholes), you
                must draw P+1 socks (pigeons) to guarantee you have at least one
                matched pair. Try it:
              </p>
              <div className="flex items-center justify-center gap-4">
                <input
                  type="number"
                  value={pigeonholeInput}
                  onChange={(e) =>
                    setPigeonholeInput(parseInt(e.target.value) || 0)
                  }
                  className="w-24 rounded-md border border-slate-300 p-2 text-center"
                />
                <button
                  onClick={handlePigeonholeCalculate}
                  className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                >
                  Calculate
                </button>
                <p className="text-xl font-bold text-orange-500">
                  You need {pigeonholeResult} socks.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-center text-xl font-semibold">
                Probability of a Random Match
              </h3>
              <p className="mb-4 text-center text-slate-600">
                The probability of finding a match decreases as you pair up
                socks and the pile shrinks.
              </p>
              <div className="h-64 md:h-72">
                <Line
                  data={probabilityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...chartTooltipTitleCallback.plugins,
                      legend: {
                        position: "bottom",
                        labels: { font: { family: "Inter" }, color: "#334155" },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: "#E2E8F0" },
                        ticks: { color: "#64748B", font: { family: "Inter" } },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: "#64748B", font: { family: "Inter" } },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section id="conclusion" className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">
            The Optimal Strategy
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600">
            For small numbers of socks, any method works. But as your laundry
            pile grows, the data is clear: the <strong>Categorical Sort</strong>{" "}
            strategy is mathematically superior. Taking a moment to sort by
            color or type first dramatically reduces the total time and
            cognitive load required to pair your socks. Happy pairing!
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-slate-800 text-white">
        <div className="container mx-auto px-6 py-4 text-center">
          <p>
            &copy; 2025 Institute of Applied Laundry Mathematics. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
