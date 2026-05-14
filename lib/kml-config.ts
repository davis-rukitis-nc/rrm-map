import type { Language } from "./translations"
import type { RouteDistance } from "@/components/map/layer-selector"

export type KMLConfig = Record<Language, Record<RouteDistance, string>>

export const kmlConfig: KMLConfig = {
  en: {
    "42km": "/kml/en/marathon.kml",
    "21km": "/kml/en/half-marathon.kml",
    "10km": "/kml/en/10km.kml",
    "6km": "/kml/en/6km.kml",
    mile: "/kml/en/mile.kml",
  },
  lv: {
    "42km": "/kml/lv/marathon.kml",
    "21km": "/kml/lv/half-marathon.kml",
    "10km": "/kml/lv/10km.kml",
    "6km": "/kml/lv/6km.kml",
    mile: "/kml/lv/mile.kml",
  },
}

export function getKmlUrl(language: Language, distance: RouteDistance): string {
  return kmlConfig[language][distance]
}
