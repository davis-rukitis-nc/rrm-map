"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Globe, Layers, MapPin, MapIcon, Route } from "lucide-react"
import type { Language, Translations } from "@/lib/translations"
import type { RouteDistance } from "./layer-selector"

interface MapControlsProps {
  visibleLayers: {
    routes: boolean
    zones: boolean
    pois: boolean
  }
  onToggleLayer: (layer: keyof typeof visibleLayers) => void
  language: Language
  onLanguageChange: (language: Language) => void
  selectedDistance: RouteDistance
  onDistanceChange: (distance: RouteDistance) => void
  translations: Translations
}

export default function MapControls({
  visibleLayers,
  onToggleLayer,
  language,
  onLanguageChange,
  selectedDistance,
  onDistanceChange,
  translations,
}: MapControlsProps) {
  return (
    <div className="map-controls-bar">
      <DistanceSelector selectedDistance={selectedDistance} onDistanceChange={onDistanceChange} translations={translations} />
      <LayerControls visibleLayers={visibleLayers} onToggleLayer={onToggleLayer} translations={translations} />
      <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} translations={translations} />
    </div>
  )
}

function getDistanceLabel(selectedDistance: RouteDistance, translations: Translations) {
  switch (selectedDistance) {
    case "42km":
      return translations.layers.marathon.name
    case "21km":
      return translations.layers.halfMarathon.name
    case "10km":
      return translations.layers.tenK.name
    case "6km":
      return translations.layers.fiveK.name
    case "mile":
      return translations.layers.mile.name
  }
}

function DistanceSelector({
  selectedDistance,
  onDistanceChange,
  translations,
}: {
  selectedDistance: RouteDistance
  onDistanceChange: (distance: RouteDistance) => void
  translations: Translations
}) {
  const items: Array<{ distance: RouteDistance; name: string; distanceText: string }> = [
    { distance: "42km", name: translations.layers.marathon.name, distanceText: translations.layers.marathon.distance },
    { distance: "21km", name: translations.layers.halfMarathon.name, distanceText: translations.layers.halfMarathon.distance },
    { distance: "10km", name: translations.layers.tenK.name, distanceText: translations.layers.tenK.distance },
    { distance: "6km", name: translations.layers.fiveK.name, distanceText: translations.layers.fiveK.distance },
    { distance: "mile", name: translations.layers.mile.name, distanceText: translations.layers.mile.distance },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rrm-control-button rrm-control-button-wide">
          <MapPin className="h-3.5 w-3.5" />
          <span>{getDistanceLabel(selectedDistance, translations)}</span>
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rrm-dropdown w-56">
        <DropdownMenuLabel>{translations.layers.title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem
            key={item.distance}
            onClick={() => onDistanceChange(item.distance)}
            className={selectedDistance === item.distance ? "rrm-dropdown-active" : ""}
          >
            <div className="flex w-full items-center justify-between gap-4">
              <span>{item.name}</span>
              {item.distanceText && <span className="text-xs opacity-70">{item.distanceText}</span>}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LayerControls({
  visibleLayers,
  onToggleLayer,
  translations,
}: {
  visibleLayers: {
    routes: boolean
    zones: boolean
    pois: boolean
  }
  onToggleLayer: (layer: keyof typeof visibleLayers) => void
  translations: Translations
}) {
  const items: Array<{ id: keyof typeof visibleLayers; icon: typeof Route; label: string }> = [
    { id: "routes", icon: Route, label: translations.controls.routes },
    { id: "zones", icon: MapIcon, label: translations.controls.zones },
    { id: "pois", icon: MapPin, label: translations.controls.pois },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rrm-control-button" aria-label={translations.controls.layers}>
          <Layers className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rrm-dropdown w-52">
        <DropdownMenuLabel>{translations.controls.layers}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => {
          const Icon = item.icon
          return (
            <DropdownMenuItem key={item.id} className="flex items-center gap-2" onSelect={(event) => event.preventDefault()}>
              <Checkbox id={`${item.id}-checkbox`} checked={visibleLayers[item.id]} onCheckedChange={() => onToggleLayer(item.id)} />
              <label htmlFor={`${item.id}-checkbox`} className="flex w-full cursor-pointer items-center gap-2 text-sm" onClick={(event) => event.stopPropagation()}>
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </label>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
  translations,
}: {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
  translations: Translations
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rrm-control-button rrm-language-button" aria-label={translations.controls.language}>
          <Globe className="h-3.5 w-3.5" />
          <span>{currentLanguage.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rrm-dropdown w-36">
        <DropdownMenuItem className={currentLanguage === "en" ? "rrm-dropdown-active" : ""} onClick={() => onLanguageChange("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem className={currentLanguage === "lv" ? "rrm-dropdown-active" : ""} onClick={() => onLanguageChange("lv")}>
          Latviešu
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
