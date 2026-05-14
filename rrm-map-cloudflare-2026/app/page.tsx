"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { type Language, translations } from "@/lib/translations"
import type { RouteDistance } from "@/components/map/layer-selector"
import { markAsOpenedFromEmbed } from "@/lib/embed-utils"

const MapComponent = dynamic(() => import("@/components/map/map-component"), {
  loading: () => <div className="map-loading">Loading map…</div>,
  ssr: false,
})

const validDistances: RouteDistance[] = ["42km", "21km", "10km", "6km", "mile"]

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en"
  const params = new URLSearchParams(window.location.search)
  const paramLanguage = params.get("lang")
  if (paramLanguage === "lv" || window.location.pathname.startsWith("/lv")) return "lv"
  return "en"
}

function getInitialDistance(): RouteDistance {
  if (typeof window === "undefined") return "42km"
  const params = new URLSearchParams(window.location.search)
  const distance = params.get("distance")?.toLowerCase() as RouteDistance | undefined
  return distance && validDistances.includes(distance) ? distance : "42km"
}

export default function Page() {
  const [visibleLayers, setVisibleLayers] = useState({ routes: true, zones: true, pois: true })
  const [language, setLanguage] = useState<Language>("en")
  const [selectedDistance, setSelectedDistance] = useState<RouteDistance>("42km")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.location.search.includes("from=embed")) {
      markAsOpenedFromEmbed()
    }

    setLanguage(getInitialLanguage())
    setSelectedDistance(getInitialDistance())
    setReady(true)
  }, [])

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  if (!ready) {
    return <main className="map-shell"><div className="map-loading">Loading map…</div></main>
  }

  return (
    <main className="map-shell" aria-hidden="false">
      <MapComponent
        visibleLayers={visibleLayers}
        language={language}
        selectedDistance={selectedDistance}
        onLanguageChange={setLanguage}
        onDistanceChange={setSelectedDistance}
        onToggleLayer={toggleLayer}
        translations={translations[language]}
      />
    </main>
  )
}
