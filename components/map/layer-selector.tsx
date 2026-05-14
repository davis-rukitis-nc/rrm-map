"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, MapPin } from "lucide-react"
import type { Translations } from "@/lib/translations"

export type RouteDistance = "42km" | "21km" | "10km" | "6km" | "mile"

interface LayerSelectorProps {
  selectedDistance: RouteDistance
  onDistanceChange: (distance: RouteDistance) => void
  translations: Translations
}

export default function LayerSelector({ selectedDistance, onDistanceChange, translations }: LayerSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const distances: Array<{ key: RouteDistance; label: string }> = [
    { key: "42km", label: translations.layers.marathon.name },
    { key: "21km", label: translations.layers.halfMarathon.name },
    { key: "10km", label: translations.layers.tenK.name },
    { key: "6km", label: translations.layers.fiveK.name },
    { key: "mile", label: translations.layers.mile.name },
  ]

  return (
    <Card className="absolute left-2 top-2 z-[1000] overflow-hidden border border-slate-200 bg-white/95 shadow-md transition-all duration-200 ease-in-out">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">{translations.layers.title}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsExpanded((value) => !value)}>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200 px-1 py-1">
          {distances.map((distance) => (
            <Button
              key={distance.key}
              variant={selectedDistance === distance.key ? "secondary" : "ghost"}
              size="sm"
              className="mb-1 w-full justify-start px-2 py-1 text-left text-sm"
              onClick={() => {
                onDistanceChange(distance.key)
                setIsExpanded(false)
              }}
            >
              {distance.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  )
}
