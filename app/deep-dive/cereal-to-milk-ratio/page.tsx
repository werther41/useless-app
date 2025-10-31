"use client"

import { useMemo, useState } from "react"
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

const pourMethodData = {
  labels: ["Cereal-First (Traditional)", "Milk-First (Texture Control)"],
  datasets: [
    {
      label: "Pouring Method Preference",
      data: [85, 15],
      backgroundColor: ["#118AB2", "#FF6B6B"],
      borderColor: "#ffffff",
      borderWidth: 4,
    },
  ],
}

const milkFatLineData = {
  labels: ["0 min (Initial)", "1 min", "3 min", "5 min"],
  datasets: [
    {
      label: "Whole Milk",
      data: [100, 95, 80, 70],
      borderColor: "#118AB2",
      backgroundColor: "#118AB233",
      fill: false,
      tension: 0.1,
      borderWidth: 3,
    },
    {
      label: "2% Milk",
      data: [100, 85, 60, 40],
      borderColor: "#06D6A0",
      backgroundColor: "#06D6A033",
      fill: false,
      tension: 0.1,
      borderWidth: 3,
    },
    {
      label: "Skim Milk",
      data: [100, 70, 30, 10],
      borderColor: "#FF6B6B",
      backgroundColor: "#FF6B6B33",
      fill: false,
      tension: 0.1,
      borderWidth: 3,
    },
  ],
}

const absorptionBarData = {
  labels: [
    ["Puffed Spheres", "/ O's"],
    "Dense Flakes",
    "Shredded Biscuits",
    ["Granola /", "Clusters"],
    ["Puffed Rice /", "Squares"],
  ],
  datasets: [
    {
      label: "Relative Milk Absorption Rate",
      data: [50, 80, 100, 30, 75],
      backgroundColor: ["#FFD166", "#FF6B6B", "#073B4C", "#06D6A0", "#118AB2"],
      borderWidth: 0,
    },
  ],
}

const ratioPhilosophyBarData = {
  labels: [
    ["Cereal Milk", "Cultivator"],
    "The Submerger",
    "Manufacturer",
    "Crunch Maximizer",
  ],
  datasets: [
    {
      label: "Cereal:Milk Ratio (e.g., 1.0 = 1:1)",
      data: [0.66, 1.0, 2.0, 2.0],
      backgroundColor: ["#118AB2", "#06D6A0", "#64748b", "#FF6B6B"],
      borderWidth: 0,
    },
  ],
}

export default function CerealToMilkRatioPage() {
  // Calculator state and logic (hoisted)
  type PhilosophyKey =
    | "submerger"
    | "crunch_maximizer"
    | "cereal_milk"
    | "incrementalist"
  type CerealTypeKey =
    | "puffed_spheres"
    | "dense_flakes"
    | "shredded_biscuits"
    | "granola"
    | "puffed_rice"
  type MilkTypeKey =
    | "skim"
    | "one_percent"
    | "two_percent"
    | "whole"
    | "oat"
    | "almond"
    | "soy"

  const [philosophy, setPhilosophy] = useState<PhilosophyKey>("submerger")
  const [cerealType, setCerealType] = useState<CerealTypeKey>("puffed_spheres")
  const [milkType, setMilkType] = useState<MilkTypeKey>("two_percent")
  const [cerealAmount, setCerealAmount] = useState<number>(1.5)

  const calcData = useMemo(
    () => ({
      philosophies: {
        submerger: { ratio: 1.0 },
        crunch_maximizer: { ratio: 0.5 },
        cereal_milk: { ratio: 1.5 },
        incrementalist: { ratio: 0.75 },
      },
      cerealTypes: {
        puffed_spheres: { milkModifier: 1.0, sogRate: 2 },
        dense_flakes: { milkModifier: 1.1, sogRate: 4 },
        shredded_biscuits: { milkModifier: 1.4, sogRate: 5 },
        granola: { milkModifier: 0.7, sogRate: 1 },
        puffed_rice: { milkModifier: 1.2, sogRate: 5 },
      },
      milkTypes: {
        skim: { fatModifier: 1.2 },
        one_percent: { fatModifier: 1.1 },
        two_percent: { fatModifier: 1.0 },
        whole: { fatModifier: 0.8 },
        oat: { fatModifier: 0.85 },
        almond: { fatModifier: 1.15 },
        soy: { fatModifier: 1.0 },
      },
    }),
    []
  )

  const calcResults = useMemo(() => {
    const p = calcData.philosophies[philosophy]
    const c = calcData.cerealTypes[cerealType]
    const m = calcData.milkTypes[milkType]

    const baseMilkAmount = cerealAmount * p.ratio
    const finalMilkAmount = baseMilkAmount * c.milkModifier

    const bowlLifeScore = c.sogRate * m.fatModifier
    let bowlLifeText: string
    if (bowlLifeScore > 4.5) bowlLifeText = "Gets Soggy Fast!"
    else if (bowlLifeScore > 3) bowlLifeText = "Average"
    else if (bowlLifeScore > 1.5) bowlLifeText = "Stays Crunchy Longer"
    else bowlLifeText = "Maximum Crunch"

    const totalParts = cerealAmount + finalMilkAmount
    const cerealPct = totalParts > 0 ? (cerealAmount / totalParts) * 100 : 50
    const milkPct = 100 - cerealPct

    return {
      finalMilkAmount,
      bowlLifeText,
      cerealPct,
      milkPct,
    }
  }, [philosophy, cerealType, milkType, cerealAmount, calcData])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 px-4 py-6 shadow-sm backdrop-blur">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-extrabold text-[#073B4C]">
            Cereal Science: Engineering Your Perfect Bowl
          </h1>
          <p className="text-lg text-slate-600">
            A data-driven analysis of the optimal cereal-to-milk ratio.
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Sog Spectrum Intro */}
          <section className="rounded-xl bg-white p-6 shadow-lg lg:col-span-3">
            <h2 className="mb-3 text-2xl font-bold text-[#073B4C]">
              The Pursuit of &quot;Cereal Bowl Bliss&quot;
            </h2>
            <p className="mb-6 text-base">
              The daily ritual of preparing cereal is a complex optimization
              problem. The goal is to achieve &quot;Cereal Bowl Bliss,&quot; a
              perfect harmony of crunch and saturation. The ideal is subjective,
              placing consumers on a spectrum of textural preference.
            </p>
            <h3 className="mb-3 text-center text-lg font-semibold">
              The Subjective Sog Spectrum
            </h3>
            <div className="rounded-lg bg-gradient-to-r from-[#FFD166] via-[#06D6A0] to-[#FF6B6B] p-3">
              <div className="flex justify-between text-xs font-bold text-white">
                <span className="text-left">
                  CRUNCH PURIST
                  <br />
                  (Max Texture)
                </span>
                <span className="text-center">
                  BALANCED IDEAL
                  <br />
                  (&quot;Bliss Point&quot;)
                </span>
                <span className="text-right">
                  SOG AFICIONADO
                  <br />
                  (Max Saturation)
                </span>
              </div>
            </div>
            <p className="mt-3 text-center text-sm text-slate-600">
              Your personal preference on this spectrum is the most important
              factor in defining your &quot;optimal&quot; ratio.
            </p>
          </section>

          {/* Pour Method Donut + Schism */}
          <section className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-3 text-2xl font-bold text-[#073B4C]">
              The Foundational Schism
            </h2>
            <p className="mb-6 text-base">
              The great debate is not just what ratio, but how it&apos;s
              achieved. The Cereal-First method is traditional, while Milk-First
              is championed for texture control.
            </p>
            <div className="h-64">
              <Doughnut
                data={pourMethodData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "60%",
                  plugins: {
                    ...chartTooltipTitleCallback.plugins,
                    legend: { position: "bottom" as const },
                  },
                }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Informal debate sampling suggests an overwhelming majority are
              Cereal-First, with a vocal Milk-First minority.
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-lg md:col-span-1 lg:col-span-2">
            <h2 className="mb-3 text-2xl font-bold text-[#073B4C]">
              A Tale of Two Goals
            </h2>
            <p className="mb-6 text-base">
              Your pouring method hints at your goal: portion control
              (Cereal-First) vs texture control (Milk-First).
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <h3 className="mb-2 text-xl font-bold text-[#118AB2]">
                  Cereal-First Doctrine
                </h3>
                <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 font-semibold">
                  1. Add Cereal
                </div>
                <div className="mx-auto my-1 h-6 w-1 bg-[#118AB2]"></div>
                <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 font-semibold">
                  2. Add Milk (until float)
                </div>
                <div className="mx-auto my-1 h-6 w-1 bg-[#06D6A0]"></div>
                <div className="rounded-lg border border-[#06D6A0] bg-[#06D6A0]/10 p-4 font-bold text-[#06D6A0]">
                  GOAL: Portion Control
                </div>
              </div>
              <div className="text-center">
                <h3 className="mb-2 text-xl font-bold text-[#FF6B6B]">
                  Milk-First Doctrine
                </h3>
                <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 font-semibold">
                  1. Add Milk
                </div>
                <div className="mx-auto my-1 h-6 w-1 bg-[#FF6B6B]"></div>
                <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 font-semibold">
                  2. Add Cereal (often incrementally)
                </div>
                <div className="mx-auto my-1 h-6 w-1 bg-[#FFD166]"></div>
                <div className="rounded-lg border border-[#FFD166] bg-[#FFD166]/10 p-4 font-bold text-[#FFD166]">
                  GOAL: Texture Control
                </div>
              </div>
            </div>
          </section>

          {/* Milk Fat Line Chart */}
          <section className="rounded-xl bg-white p-6 shadow-lg lg:col-span-3">
            <h2 className="mb-3 text-2xl font-bold text-[#073B4C]">
              The Science of the Soak: Your &quot;Bowl Life&quot;
            </h2>
            <p className="mb-6 text-base">
              &quot;Bowl Life&quot; is how long cereal keeps acceptable crunch.
              Milk fat creates a hydrophobic barrier that slows absorption.
            </p>
            <div className="h-80">
              <Line
                data={milkFatLineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: { display: true, text: "Crunchiness Level (%)" },
                    },
                    x: { title: { display: true, text: "Time in Milk" } },
                  },
                  ...chartTooltipTitleCallback,
                }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Whole milk extends crunch significantly; skim milk accelerates
              sogginess.
            </p>
          </section>

          {/* Absorption Horizontal Bar */}
          <section className="rounded-xl bg-white p-6 shadow-lg md:col-span-2">
            <h2 className="mb-3 text-2xl font-bold text-[#073B4C]">
              Variable 1: Cereal Morphology
            </h2>
            <p className="mb-6 text-base">
              Shape and density matter. Milk-gobblers absorb rapidly; floaters
              absorb slowly.
            </p>
            <div className="h-80">
              <Bar
                data={absorptionBarData}
                options={{
                  indexAxis: "y" as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Relative Absorption Rate (Higher = Faster)",
                      },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    ...chartTooltipTitleCallback.plugins,
                  },
                }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Choose milk type and eating speed accordingly.
            </p>
          </section>

          {/* Vessel Geometry */}
          <section className="rounded-xl bg-white p-6 shadow-lg md:col-span-1">
            <h2 className="mb-3 text-2xl font-bold text-[#073B4C]">
              Variable 2: Vessel Geometry
            </h2>
            <p className="mb-6 text-base">
              Bowl shape affects perception. Wide bowls encourage more cereal;
              deep bowls can hide milk level.
            </p>
            <div className="grid h-64 grid-cols-2 gap-4">
              <div className="text-center">
                <div className="h-24 w-full rounded-b-full border-x-4 border-b-4 border-[#118AB2]"></div>
                <h4 className="mt-3 text-lg font-bold">Wide, Shallow Bowl</h4>
                <p className="text-sm text-slate-600">
                  Encourages over-pouring of cereal.
                </p>
              </div>
              <div className="text-center">
                <div className="h-24 w-3/4 rounded-lg border-4 border-[#FF6B6B]"></div>
                <h4 className="mt-3 text-lg font-bold">Deep, Narrow Bowl</h4>
                <p className="text-sm text-slate-600">
                  Harder to judge milk level.
                </p>
              </div>
            </div>
          </section>

          {/* Ratio Philosophy */}
          <section className="rounded-xl bg-white p-6 shadow-lg lg:col-span-3">
            <h2 className="mb-3 text-2xl font-bold text-[#073B4C]">
              The Philosophy of the Ratio
            </h2>
            <p className="mb-6 text-base">
              Ideal ratio reflects philosophy: milk-heavy cultivator vs
              cereal-heavy maximizer, with manufacturer guidance often at 2:1 by
              volume.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-72">
                <Bar
                  data={ratioPhilosophyBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Cereal-to-Milk Ratio by Volume",
                        },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                      ...chartTooltipTitleCallback.plugins,
                    },
                  }}
                />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="rounded-lg bg-slate-100 p-4">
                  <h4 className="text-lg font-bold text-[#073B4C]">
                    The &quot;Official&quot; Ratio
                  </h4>
                  <p className="text-3xl font-extrabold text-[#FF6B6B]">2:1</p>
                  <p className="font-semibold text-slate-700">
                    (Cereal to Milk, by Volume)
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Manufacturer recommendation; aligns with the Crunch
                    Maximizer.
                  </p>
                </div>
                <div className="rounded-lg bg-slate-100 p-4">
                  <h4 className="text-lg font-bold text-[#073B4C]">
                    The &quot;Submerger&quot; Ratio
                  </h4>
                  <p className="text-3xl font-extrabold text-[#118AB2]">1:1</p>
                  <p className="font-semibold text-slate-700">
                    (Cereal to Milk, by Volume)
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    A common practice where milk is poured until cereal floats.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Calculator Section */}
          <section
            id="calculator"
            className="rounded-xl bg-white p-6 shadow-lg lg:col-span-3"
          >
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-[#073B4C] md:text-3xl">
                Personal Ratio Calculator
              </h3>
              <p className="mt-2 text-slate-600">
                Follow the steps to find your personalized Cereal Bowl Bliss.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
              {/* Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-lg font-semibold text-slate-700">
                    Step 1: Define Your Philosophy
                  </label>
                  <select
                    value={philosophy}
                    onChange={(e) => setPhilosophy(e.target.value as any)}
                    className="w-full rounded-lg border-2 border-transparent bg-slate-100 p-3 transition focus:border-[#118AB2] focus:outline-none focus:ring-2 focus:ring-[#118AB2]"
                  >
                    <option value="submerger">The Submerger (Balanced)</option>
                    <option value="crunch_maximizer">
                      The Crunch Maximizer (Crunchy)
                    </option>
                    <option value="cereal_milk">
                      The Cereal Milk Cultivator (Milky)
                    </option>
                    <option value="incrementalist">
                      The Incrementalist (Max Crunch)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-lg font-semibold text-slate-700">
                    Step 2: Analyze Your Cereal
                  </label>
                  <select
                    value={cerealType}
                    onChange={(e) => setCerealType(e.target.value as any)}
                    className="w-full rounded-lg border-2 border-transparent bg-slate-100 p-3 transition focus:border-[#118AB2] focus:outline-none focus:ring-2 focus:ring-[#118AB2]"
                  >
                    <option value="puffed_spheres">
                      Puffed Spheres (e.g., Cheerios, Kix)
                    </option>
                    <option value="dense_flakes">
                      Dense Flakes (e.g., Corn Flakes)
                    </option>
                    <option value="shredded_biscuits">
                      Shredded Biscuits (e.g., Shredded Wheat)
                    </option>
                    <option value="granola">Granola / Clusters</option>
                    <option value="puffed_rice">
                      Puffed Rice/Squares (e.g., Rice Krispies)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-lg font-semibold text-slate-700">
                    Step 3: Choose Your Liquid Strategically
                  </label>
                  <select
                    value={milkType}
                    onChange={(e) => setMilkType(e.target.value as any)}
                    className="w-full rounded-lg border-2 border-transparent bg-slate-100 p-3 transition focus:border-[#118AB2] focus:outline-none focus:ring-2 focus:ring-[#118AB2]"
                  >
                    <option value="skim">Skim Milk</option>
                    <option value="one_percent">1% Milk</option>
                    <option value="two_percent">2% Milk</option>
                    <option value="whole">Whole Milk</option>
                    <option value="oat">Oat Milk (Creamy)</option>
                    <option value="almond">Almond Milk (Thinner)</option>
                    <option value="soy">Soy Milk</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-lg font-semibold text-slate-700">
                    Step 4: Choose Your Cereal Amount (cups)
                  </label>
                  <input
                    type="number"
                    value={cerealAmount}
                    min={0}
                    step={0.25}
                    onChange={(e) =>
                      setCerealAmount(parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border-2 border-transparent bg-slate-100 p-3 transition focus:border-[#118AB2] focus:outline-none focus:ring-2 focus:ring-[#118AB2]"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#118AB233] bg-[#118AB20D] p-6 text-center">
                <h4 className="mb-4 text-xl font-bold text-[#073B4C]">
                  Your Optimal Ratio
                </h4>
                <div className="mb-4 flex h-8 w-full max-w-xs overflow-hidden rounded-full border-2 border-slate-300">
                  <div
                    className="bg-[#FFD166] transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, calcResults.cerealPct)
                      )}%`,
                    }}
                  />
                  <div
                    className="bg-[#118AB2] transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, calcResults.milkPct)
                      )}%`,
                    }}
                  />
                </div>
                <div className="mb-2 text-xl font-bold text-slate-800 md:text-2xl">
                  <span className="text-[#915930]">
                    {cerealAmount.toFixed(2)} cups
                  </span>{" "}
                  Cereal
                  <span className="mx-2 text-slate-400">&</span>
                  <span className="text-[#0d4660]">
                    {calcResults.finalMilkAmount.toFixed(2)} cups
                  </span>{" "}
                  Milk
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  (Volumetric Ratio)
                </p>

                <div className="w-full rounded-lg bg-white p-4 shadow-inner">
                  <h5 className="font-semibold text-slate-700">
                    Predicted &quot;Bowl Life&quot;
                  </h5>
                  <p className="text-lg font-bold text-[#118AB2]">
                    {calcResults.bowlLifeText}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Research Reference */}
      <section className="mb-8 rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-center text-xl font-semibold text-[#00796B]">
          Full Research Article
        </h3>
        <p className="mb-4 text-center text-gray-600">
          For the complete scientific methodology, detailed data analysis, and
          comprehensive experiments, read our full research article:
        </p>
        <div className="text-center">
          <a
            href="/deep-dive/cereal-milk-ratio-deep-dive"
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

      <footer className="mt-8 border-t border-slate-200 py-8 text-center">
        <p className="text-sm text-slate-500">
          An infographic based on the &quot;Optimal Cereal-to-Milk Ratio&quot;
          analysis.
        </p>
      </footer>
    </div>
  )
}
