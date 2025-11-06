"use client"

import { useMemo } from "react"
import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { Bubble } from "react-chartjs-2"

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title)

interface Topic {
  id: string
  text: string
  type: string
  occurrenceCount: number
  avgTfidfScore: number
  lastSeenAt: string
  combinedScore: number
}

interface TopicBubbleChartProps {
  topics: Topic[]
  selectedTopics: string[]
  onTopicSelect: (topicText: string) => void
  maxSelection?: number
}

// Color mapping for entity types (RGB values for Chart.js)
const getEntityColorRgba = (type: string, alpha: number = 0.6): string => {
  const colorMap: Record<string, string> = {
    PERSON: "rgb(34, 197, 94)", // green-500
    ORG: "rgb(168, 85, 247)", // purple-500
    LOCATION: "rgb(249, 115, 22)", // orange-500
    PRODUCT: "rgb(59, 130, 246)", // blue-500
    PROGRAMMING_LANGUAGE: "rgb(6, 182, 212)", // cyan-500
    SCIENTIFIC_TERM: "rgb(99, 102, 241)", // indigo-500
    FIELD_OF_STUDY: "rgb(234, 179, 8)", // yellow-500
    EVENT: "rgb(239, 68, 68)", // red-500
    WORK_OF_ART: "rgb(236, 72, 153)", // pink-500
    LAW_OR_POLICY: "rgb(100, 116, 139)", // slate-500
    TECH: "rgb(59, 130, 246)", // blue-500 (legacy)
    CONCEPT: "rgb(234, 179, 8)", // yellow-500 (legacy)
  }

  const baseColor = colorMap[type] || "rgb(156, 163, 175)" // gray-400
  return baseColor.replace("rgb", "rgba").replace(")", `, ${alpha})`)
}

const getEntityBorderColor = (type: string): string => {
  return getEntityColorRgba(type, 1)
}

// Map topic types to shorter, readable names for legend display
const getTopicTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    PERSON: "Person",
    ORG: "Organization",
    LOCATION: "Location",
    PRODUCT: "Product",
    PROGRAMMING_LANGUAGE: "Programming",
    SCIENTIFIC_TERM: "Scientific Term",
    FIELD_OF_STUDY: "Field of Study",
    EVENT: "Event",
    WORK_OF_ART: "Work of Art",
    LAW_OR_POLICY: "Law or Policy",
    TECH: "Tech",
    CONCEPT: "Concept",
  }

  return labelMap[type] || type
}

export function TopicBubbleChart({
  topics,
  selectedTopics,
  onTopicSelect,
  maxSelection = 5,
}: TopicBubbleChartProps) {
  // Group topics by type for color coding
  const topicsByType = useMemo(() => {
    const groups: Record<string, Topic[]> = {}
    topics.forEach((topic) => {
      if (!groups[topic.type]) {
        groups[topic.type] = []
      }
      groups[topic.type].push(topic)
    })
    return groups
  }, [topics])

  // Calculate freshness: convert lastSeenAt to timestamp (higher = more recent)
  // Also calculate max occurrence count for scaling
  const { chartData, maxOccurrence } = useMemo(() => {
    const maxOcc = Math.max(...topics.map((t) => t.occurrenceCount), 1)

    // Calculate min and max timestamps for normalization
    const timestamps = topics.map((t) => new Date(t.lastSeenAt).getTime())
    const minTimestamp = Math.min(...timestamps)
    const maxTimestamp = Math.max(...timestamps)
    const timestampRange = maxTimestamp - minTimestamp || 1

    // Create datasets grouped by type
    const datasets = Object.entries(topicsByType).map(([type, typeTopics]) => {
      return {
        label: getTopicTypeLabel(type),
        data: typeTopics.map((topic) => {
          // X-axis: Freshness (normalized timestamp, 0-1 scale)
          const timestamp = new Date(topic.lastSeenAt).getTime()
          const freshness = (timestamp - minTimestamp) / timestampRange

          // Y-axis: Uniqueness (avgTfidfScore)
          const uniqueness = topic.avgTfidfScore

          // Bubble size: Popularity (occurrenceCount), scaled to max 20px radius
          // Using sqrt for better visual distribution
          const minRadius = 4
          const maxRadius = 18
          const normalizedOccurrence = Math.sqrt(topic.occurrenceCount / maxOcc)
          const radius =
            minRadius + normalizedOccurrence * (maxRadius - minRadius)

          return {
            x: freshness,
            y: uniqueness,
            r: radius,
            topicText: topic.text,
            topicType: topic.type,
            occurrenceCount: topic.occurrenceCount,
            avgTfidfScore: topic.avgTfidfScore,
            lastSeenAt: topic.lastSeenAt,
          }
        }),
        backgroundColor: getEntityColorRgba(type, 0.6),
        borderColor: getEntityBorderColor(type),
        borderWidth: (ctx: any) => {
          const topicText = ctx.raw?.topicText
          return selectedTopics.includes(topicText) ? 3 : 1
        },
      }
    })

    return {
      chartData: {
        datasets,
      },
      maxOccurrence: maxOcc,
    }
  }, [topics, topicsByType, selectedTopics])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Freshness (More Recent →)",
            font: {
              size: 12,
            },
          },
          ticks: {
            callback: function (value: any) {
              // Convert normalized value back to days ago for display
              const timestamps = topics.map((t) =>
                new Date(t.lastSeenAt).getTime()
              )
              const minTimestamp = Math.min(...timestamps)
              const maxTimestamp = Math.max(...timestamps)
              const timestampRange = maxTimestamp - minTimestamp || 1
              const timestamp = minTimestamp + value * timestampRange
              const daysAgo = Math.round(
                (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
              )
              return daysAgo === 0 ? "Today" : `${daysAgo}d ago`
            },
          },
        },
        y: {
          title: {
            display: true,
            text: "Uniqueness (More Unique →)",
            font: {
              size: 12,
            },
          },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            usePointStyle: true,
            padding: 10,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const raw = context.raw
              const date = new Date(raw.lastSeenAt).toLocaleDateString()
              const daysAgo = Math.round(
                (Date.now() - new Date(raw.lastSeenAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
              return [
                `Topic: ${raw.topicText}`,
                `Type: ${raw.topicType}`,
                `Popularity: ${raw.occurrenceCount}`,
                `Uniqueness: ${raw.avgTfidfScore.toFixed(3)}`,
                `Last seen: ${
                  daysAgo === 0 ? "Today" : `${daysAgo} days ago`
                } (${date})`,
              ]
            },
          },
        },
      },
      onClick: (event: any, elements: any[]) => {
        if (elements.length > 0) {
          const element = elements[0]
          const datasetIndex = element.datasetIndex
          const index = element.index

          // Get topic data from the clicked element
          const clickedData = chartData.datasets[datasetIndex]?.data[index]
          if (!clickedData) return

          const topicText =
            clickedData.topicText || (clickedData as any).topicText

          // Check if we can select (not disabled)
          const isCurrentlySelected = selectedTopics.includes(topicText)
          const canSelect =
            isCurrentlySelected || selectedTopics.length < maxSelection

          if (canSelect && topicText) {
            onTopicSelect(topicText)
          }
        }
      },
      onHover: (event: any, elements: any[]) => {
        if (elements.length > 0) {
          event.native.target.style.cursor = "pointer"
        } else {
          event.native.target.style.cursor = "default"
        }
      },
    }),
    [chartData, selectedTopics, maxSelection, topics, onTopicSelect]
  )

  return (
    <div className="h-[500px] w-full">
      <Bubble data={chartData} options={chartOptions} />
    </div>
  )
}
