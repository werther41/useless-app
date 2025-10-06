"use client"

import { useEffect, useRef } from "react"
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { Bar, Doughnut, Line } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
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

const sharedDonutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%",
  plugins: {
    ...chartTooltipTitleCallback.plugins,
    legend: {
      position: "bottom" as const,
    },
  },
}

const singleFlipData = {
  labels: ["Moisture Lost", "Moisture Retained"].map(wrapLabels),
  datasets: [
    {
      label: "Juiciness",
      data: [35, 65],
      backgroundColor: ["#FFED66", "#FF5E5B"],
      borderColor: "#FFFFEA",
      borderWidth: 4,
    },
  ],
}

const multiFlipData = {
  labels: ["Moisture Lost", "Moisture Retained"].map(wrapLabels),
  datasets: [
    {
      label: "Juiciness",
      data: [10, 90],
      backgroundColor: ["#FFED66", "#00CECB"],
      borderColor: "#FFFFEA",
      borderWidth: 4,
    },
  ],
}

const timeChartData = {
  labels: ["Single Flip Method", "Multi-Flip Method"].map(wrapLabels),
  datasets: [
    {
      label: "Time (minutes)",
      data: [10, 7],
      backgroundColor: ["#FF5E5B", "#00CECB"],
      borderColor: "#00796B",
      borderWidth: 2,
      borderRadius: 5,
    },
  ],
}

const tempChartData = {
  labels: ["0s", "30s", "60s", "90s", "120s", "150s", "180s"],
  datasets: [
    {
      label: "Single Flip (Top Side Temp)",
      data: [70, 180, 170, 80, 190, 180, 90],
      borderColor: "#FF5E5B",
      tension: 0.1,
      fill: false,
    },
    {
      label: "Multi-Flip (Average Temp)",
      data: [120, 130, 135, 140, 145, 150, 155],
      borderColor: "#00CECB",
      tension: 0.1,
      fill: false,
    },
  ],
}

export default function BurgerInfographic() {
  return (
    <div className="min-h-screen bg-[#FFFFEA] text-[#00796B]">
      {/* Header */}
      <header className="bg-[#00796B] p-8 text-center text-[#FFFFEA] md:p-12">
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">
          The Great Burger Flip Debate
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg md:text-xl">
          Challenging culinary tradition with a little bit of science. Does
          flipping your burger only once really produce the best results?
          Let&apos;s find out.
        </p>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {/* Comparison Section */}
        <section id="comparison" className="mb-12">
          <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
            Two Methods Enter the Griddle
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Single Flip Method */}
            <div className="flex flex-col rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-center text-2xl font-bold text-[#FF5E5B]">
                The Single Flip (The Myth)
              </h3>
              <p className="mb-6 text-center">
                The traditionalist&apos;s approach: cook one side completely,
                then flip only once to finish. This method is simple but has
                drawbacks.
              </p>
              <div className="flex grow flex-col justify-around">
                <div className="my-4 text-center">
                  <h4 className="text-lg font-bold">Evenness of Cooking</h4>
                  <div
                    className="mx-auto my-2 flex h-24 w-48 flex-col justify-center p-1"
                    aria-label="Burger cross-section showing thick overcooked layer"
                  >
                    <div className="h-1/6 rounded-t-lg bg-[#795548]"></div>
                    <div className="h-3/6 bg-gray-400"></div>
                    <div className="h-2/6 rounded-b-lg bg-[#f4a2a2]"></div>
                  </div>
                  <p className="text-sm">
                    Results in a large band of overcooked, gray meat.
                  </p>
                </div>
                <div className="h-64 md:h-80">
                  <Doughnut
                    data={singleFlipData}
                    options={{
                      ...sharedDonutOptions,
                      plugins: {
                        ...sharedDonutOptions.plugins,
                        title: {
                          display: true,
                          text: "Juiciness: Single Flip",
                          font: { size: 16 },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Multi-Flip Method */}
            <div className="flex flex-col rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-center text-2xl font-bold text-[#00CECB]">
                The Multi-Flip (The Science)
              </h3>
              <p className="mb-6 text-center">
                The scientist&apos;s method: flip the patty every 15-30 seconds.
                This manages heat for a surprisingly better outcome.
              </p>
              <div className="flex grow flex-col justify-around">
                <div className="my-4 text-center">
                  <h4 className="text-lg font-bold">Evenness of Cooking</h4>
                  <div
                    className="mx-auto my-2 flex h-24 w-48 flex-col justify-center p-1"
                    aria-label="Burger cross-section showing thin overcooked layer"
                  >
                    <div className="h-1/6 rounded-t-lg bg-[#795548]"></div>
                    <div className="h-1/6 bg-gray-300"></div>
                    <div className="h-4/6 rounded-b-lg bg-[#f4a2a2]"></div>
                  </div>
                  <p className="text-sm">
                    Creates a perfectly pink center with a minimal gray band.
                  </p>
                </div>
                <div className="h-64 md:h-80">
                  <Doughnut
                    data={multiFlipData}
                    options={{
                      ...sharedDonutOptions,
                      plugins: {
                        ...sharedDonutOptions.plugins,
                        title: {
                          display: true,
                          text: "Juiciness: Multi-Flip",
                          font: { size: 16 },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Section */}
        <section id="data" className="mb-12">
          <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
            The Results Are In
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-center text-2xl font-bold">
                Cooking Time Comparison
              </h3>
              <p className="mb-4 text-center">
                By applying heat to both sides more consistently, the multi-flip
                method significantly reduces total cooking time.
              </p>
              <div className="h-80">
                <Bar
                  data={timeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true, max: 12 },
                    },
                    ...chartTooltipTitleCallback,
                  }}
                />
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-center text-2xl font-bold">
                The Science of the Sizzle
              </h3>
              <p className="mb-1 text-center">
                Flipping often minimizes the time one side is exposed to air,
                preventing it from cooling down. This keeps the internal
                temperature more stable, cooking the meat gently and evenly from
                both directions.
              </p>
              <div className="h-80">
                <Line
                  data={tempChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: "Surface Temperature (°F)",
                        },
                      },
                    },
                    plugins: {
                      ...chartTooltipTitleCallback.plugins,
                      title: {
                        display: true,
                        text: "Burger Surface Temperature Stability",
                        font: { size: 14 },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Cooking Matrix Section */}
        <section id="cooking-matrix" className="mb-12">
          <div className="rounded-lg bg-white p-6 shadow-xl md:p-8">
            <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">
              A Cook&apos;s Guide to Burger Flipping
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm md:text-base">
                <thead>
                  <tr className="border-b-2 border-[#00796B]">
                    <th className="w-1/4 p-4 text-left font-bold">Technique</th>
                    <th className="w-3/8 bg-red-50 p-4 text-center font-bold text-[#FF5E5B]">
                      Single Flip
                    </th>
                    <th className="w-3/8 bg-cyan-50 p-4 text-center font-bold text-[#00CECB]">
                      Multi-Flip
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-bold">Cooking Time</td>
                    <td className="p-4 text-center">Longer (~30% more time)</td>
                    <td className="p-4 text-center">Faster & More Efficient</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-bold">Evenness</td>
                    <td className="p-4 text-center">
                      Large overcooked &quot;gray band&quot;
                    </td>
                    <td className="p-4 text-center">
                      Edge-to-edge pink, minimal gray band
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-bold">Crust</td>
                    <td className="p-4 text-center">
                      Decent, but can be uneven
                    </td>
                    <td className="p-4 text-center">
                      Excellent, deep brown & even
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-bold">Juiciness</td>
                    <td className="p-4 text-center">
                      Less juicy due to moisture loss
                    </td>
                    <td className="p-4 text-center">
                      Very juicy, better moisture retention
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Effort Level</td>
                    <td className="p-4 text-center">
                      Low (less hands-on time)
                    </td>
                    <td className="p-4 text-center">
                      High (requires constant attention)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Verdict Section */}
        <section
          id="verdict"
          className="mb-12 rounded-lg bg-[#00796B] p-8 text-center text-[#FFFFEA] shadow-xl md:p-12"
        >
          <h2 className="mb-6 text-3xl font-black md:text-4xl">
            The Verdict: Flip It Good!
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg">
            The science is clear. For a faster, juicier, and more evenly cooked
            burger, flipping multiple times is the superior method.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-[#FFFFEA] p-6 text-[#00796B]">
              <p className="text-5xl font-black">30%</p>
              <p className="text-xl font-bold">FASTER</p>
            </div>
            <div className="rounded-lg bg-[#FFFFEA] p-6 text-[#00796B]">
              <p className="text-5xl font-black">25%</p>
              <p className="text-xl font-bold">JUICIER</p>
            </div>
            <div className="rounded-lg bg-[#FFFFEA] p-6 text-[#00796B]">
              <p className="text-5xl font-black">100%</p>
              <p className="text-xl font-bold">MORE EVENLY COOKED</p>
            </div>
          </div>
        </section>

        {/* How To Section */}
        <section id="howto">
          <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
            How to Cook the Perfect Burger
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center">
            Follow this simple process to leverage the multi-flip method for
            your best burger yet.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#00CECB] text-center font-bold text-[#FFFFEA]">
              <span>1. Preheat Pan</span>
            </div>
            <div className="mx-4 rotate-90 text-4xl text-[#00796B] md:rotate-0">
              &rarr;
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#00CECB] text-center font-bold text-[#FFFFEA]">
              <span>2. Add Patty</span>
            </div>
            <div className="mx-4 rotate-90 text-4xl text-[#00796B] md:rotate-0">
              &rarr;
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#FF5E5B] text-center font-bold text-[#FFFFEA]">
              <span>3. Flip every 30s</span>
            </div>
            <div className="mx-4 rotate-90 text-4xl text-[#00796B] md:rotate-0">
              &rarr;
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#00CECB] text-center font-bold text-[#FFFFEA]">
              <span>4. Add Cheese</span>
            </div>
            <div className="mx-4 rotate-90 text-4xl text-[#00796B] md:rotate-0">
              &rarr;
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#00CECB] text-center font-bold text-[#FFFFEA]">
              <span>5. Rest & Serve</span>
            </div>
          </div>
        </section>
      </main>

      {/* Research Reference */}
      <section className="mb-8 rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-center text-xl font-semibold text-[#00796B]">
          Full Research Article
        </h3>
        <p className="mb-4 text-center text-gray-600">
          For the complete scientific methodology, detailed data analysis, and
          comprehensive cooking experiments, read our full research article:
        </p>
        <div className="text-center">
          <a
            href="/deep-dive/burger-infographic-deep-dive"
            className="inline-flex items-center gap-2 rounded-lg bg-[#00796B] px-6 py-3 text-white transition-colors hover:bg-[#005a4a]"
          >
            <span>Read Full Research Article</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 bg-gray-100 p-6 text-center text-sm text-gray-600">
        <p>
          &copy; 2025 Useless Facts. Making the world slightly more informed
          about completely irrelevant things.
        </p>
      </footer>
    </div>
  )
}
