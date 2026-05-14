export type Language = "en" | "lv"

export interface Translations {
  layers: {
    title: string
    marathon: { name: string; distance: string }
    halfMarathon: { name: string; distance: string }
    tenK: { name: string; distance: string }
    fiveK: { name: string; distance: string }
    mile: { name: string; distance: string }
  }
  controls: {
    myLocation: string
    routes: string
    zones: string
    pois: string
    fullscreen: string
    exitFullscreen: string
    layers: string
    language: string
  }
  errors: {
    locationNotSupported: string
    locationDenied: string
    locationUnavailable: string
    locationTimeout: string
    outsideRiga: string
    fullscreenNotSupported: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    layers: {
      title: "Distance",
      marathon: { name: "Marathon", distance: "42 km" },
      halfMarathon: { name: "Half marathon", distance: "21 km" },
      tenK: { name: "10 km", distance: "" },
      fiveK: { name: "6 km", distance: "" },
      mile: { name: "DPD Mile", distance: "1609 m" },
    },
    controls: {
      myLocation: "My location",
      routes: "Route",
      zones: "Zones",
      pois: "Points",
      fullscreen: "Enter fullscreen",
      exitFullscreen: "Exit fullscreen",
      layers: "Layers",
      language: "Language",
    },
    errors: {
      locationNotSupported: "Your browser does not support geolocation.",
      locationDenied: "Location access was denied.",
      locationUnavailable: "Location information is unavailable.",
      locationTimeout: "Location request timed out.",
      outsideRiga: "Your location is outside the Riga area. Centering on Riga.",
      fullscreenNotSupported: "Fullscreen mode is not supported by your browser.",
    },
  },
  lv: {
    layers: {
      title: "Distance",
      marathon: { name: "Maratons", distance: "42 km" },
      halfMarathon: { name: "Pusmaratons", distance: "21 km" },
      tenK: { name: "10 km", distance: "" },
      fiveK: { name: "6 km", distance: "" },
      mile: { name: "DPD jūdze", distance: "1609 m" },
    },
    controls: {
      myLocation: "Mana atrašanās vieta",
      routes: "Trase",
      zones: "Zonas",
      pois: "Punkti",
      fullscreen: "Pilnekrāna režīms",
      exitFullscreen: "Iziet no pilnekrāna režīma",
      layers: "Slāņi",
      language: "Valoda",
    },
    errors: {
      locationNotSupported: "Jūsu pārlūkprogramma neatbalsta ģeolokāciju.",
      locationDenied: "Piekļuve atrašanās vietai tika liegta.",
      locationUnavailable: "Atrašanās vietas informācija nav pieejama.",
      locationTimeout: "Atrašanās vietas pieprasījuma noilgums.",
      outsideRiga: "Jūsu atrašanās vieta ir ārpus Rīgas. Centrējam uz Rīgu.",
      fullscreenNotSupported: "Jūsu pārlūkprogramma neatbalsta pilnekrāna režīmu.",
    },
  },
}
