"use client"

import { useEffect, useMemo, useState } from "react"
import { Marker, Popup, Polyline, Polygon, useMap } from "react-leaflet"
import L from "leaflet"
import { Loader2 } from "lucide-react"
import { parseKML } from "@/lib/kml-parser"

interface KMLLayerProps {
  url: string
  showRoutes?: boolean
  showZones?: boolean
  showPOIs?: boolean
}

type Feature = {
  geometry?: {
    type?: string
    coordinates?: any
    geometries?: Feature["geometry"][]
  }
  properties?: Record<string, any>
}

function extendBounds(bounds: L.LatLngBounds, geometry: Feature["geometry"]) {
  if (!geometry) return

  const type = geometry.type
  const coordinates = geometry.coordinates

  if (type === "Point" && Array.isArray(coordinates)) {
    const [lng, lat] = coordinates
    bounds.extend([lat, lng])
    return
  }

  if (type === "LineString" && Array.isArray(coordinates)) {
    coordinates.forEach((coord: number[]) => bounds.extend([coord[1], coord[0]]))
    return
  }

  if (type === "MultiLineString" && Array.isArray(coordinates)) {
    coordinates.flat().forEach((coord: number[]) => bounds.extend([coord[1], coord[0]]))
    return
  }

  if (type === "Polygon" && Array.isArray(coordinates)) {
    coordinates.flat().forEach((coord: number[]) => bounds.extend([coord[1], coord[0]]))
    return
  }

  if (type === "MultiPolygon" && Array.isArray(coordinates)) {
    coordinates.flat(2).forEach((coord: number[]) => bounds.extend([coord[1], coord[0]]))
    return
  }

  if (type === "GeometryCollection" && Array.isArray(geometry.geometries)) {
    geometry.geometries.forEach((item) => extendBounds(bounds, item))
  }
}

function linePositions(geometry: Feature["geometry"]) {
  if (!geometry) return []

  if (geometry.type === "LineString") {
    return [geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]])]
  }

  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.map((line: number[][]) => line.map((coord) => [coord[1], coord[0]]))
  }

  return []
}

function polygonPositions(geometry: Feature["geometry"]) {
  if (!geometry) return []

  if (geometry.type === "Polygon") {
    return [geometry.coordinates.map((ring: number[][]) => ring.map((coord) => [coord[1], coord[0]]))]
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((polygon: number[][][]) => polygon.map((ring) => ring.map((coord) => [coord[1], coord[0]])))
  }

  return []
}

function popupTitle(properties: Record<string, any>, fallback: string) {
  const title = properties.name || properties.Name || fallback
  return typeof title === "string" ? title : fallback
}

function popupDescription(properties: Record<string, any>) {
  const description = properties.description || properties.Description || ""
  return typeof description === "string" ? description.trim() : ""
}

function popupImages(properties: Record<string, any>) {
  if (Array.isArray(properties.images)) return properties.images.filter((item) => typeof item === "string" && item.trim())
  if (typeof properties.image === "string" && properties.image.trim()) return [properties.image.trim()]
  return []
}

function safeIcon(iconUrl?: string) {
  if (!iconUrl) return undefined

  return L.icon({
    iconUrl,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -13],
  })
}

function PopupImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) return null

  return (
    <figure className="rrm-popup-media">
      <img src={src} alt={title ? `${title} image` : ""} loading="lazy" decoding="async" onError={() => setFailed(true)} />
    </figure>
  )
}

function FeaturePopup({ properties, fallback, kind = "point" }: { properties: Record<string, any>; fallback: string; kind?: "point" | "route" | "zone" }) {
  const title = popupTitle(properties, fallback)
  const description = kind === "point" ? popupDescription(properties) : ""
  const images = kind === "point" ? popupImages(properties) : []
  const hasExtraContent = Boolean(description || images.length)

  return (
    <Popup
      className={hasExtraContent ? "centered-popup rich-popup" : "centered-popup compact-popup"}
      maxWidth={420}
      minWidth={hasExtraContent ? 300 : 220}
      autoPan
      autoPanPadding={[22, 22]}
      keepInView
    >
      <article className={hasExtraContent ? "rrm-popup-card rrm-popup-card-rich" : "rrm-popup-card"}>
        {images[0] && <PopupImage src={images[0]} title={title} />}

        <div className="rrm-popup-body">
          <h3>{title}</h3>
          {description && <div className="rrm-popup-description" dangerouslySetInnerHTML={{ __html: description }} />}
        </div>
      </article>
    </Popup>
  )
}

export default function KMLLayer({ url, showRoutes = true, showZones = true, showPOIs = true }: KMLLayerProps) {
  const [kmlData, setKmlData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const map = useMap()

  useEffect(() => {
    let cancelled = false

    async function loadKML() {
      try {
        setLoading(true)
        setError(null)

        const data = await parseKML(url)
        if (cancelled) return

        setKmlData(data)

        const bounds = L.latLngBounds([])
        data.features?.forEach((feature: Feature) => extendBounds(bounds, feature.geometry))

        if (bounds.isValid()) {
          window.requestAnimationFrame(() => {
            map.flyToBounds(bounds, {
              paddingTopLeft: [24, 92],
              paddingBottomRight: [24, 30],
              maxZoom: 15.5,
              duration: 0.9,
              easeLinearity: 0.22,
            })
          })
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading KML:", err)
          setError("Failed to load KML data")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadKML()

    return () => {
      cancelled = true
    }
  }, [url, map])

  const features = useMemo<Feature[]>(() => kmlData?.features || [], [kmlData])

  if (loading) {
    return (
      <div className="rrm-map-loader" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="rrm-map-error">Error loading map data</div>
  }

  return (
    <>
      {showPOIs &&
        features
          .filter((feature) => feature.geometry?.type === "Point")
          .map((feature, index) => {
            const coordinates = feature.geometry?.coordinates
            const properties = feature.properties || {}
            if (!Array.isArray(coordinates)) return null

            return (
              <Marker
                key={`poi-${url}-${index}`}
                position={[coordinates[1], coordinates[0]]}
                icon={safeIcon(properties.icon)}
                eventHandlers={{
                  add: (event) => {
                    const element = event.target.getElement()
                    if (element) {
                      element.setAttribute("aria-hidden", "false")
                      element.setAttribute("role", "img")
                      element.setAttribute("aria-label", popupTitle(properties, `Point of interest ${index + 1}`))
                    }
                  },
                }}
              >
                <FeaturePopup properties={properties} fallback={`Point ${index + 1}`} kind="point" />
              </Marker>
            )
          })}

      {showRoutes &&
        features
          .filter((feature) => ["LineString", "MultiLineString"].includes(feature.geometry?.type || ""))
          .flatMap((feature, index) => {
            const properties = feature.properties || {}
            const positions = linePositions(feature.geometry)
            const color = properties.stroke || "#cc2328"
            const weight = Math.max(Number(properties.strokeWidth || 4), 3)
            const opacity = properties.strokeOpacity ?? 0.86

            return positions.map((positionSet, subIndex) => (
              <Polyline
                key={`route-${url}-${index}-${subIndex}`}
                positions={positionSet as any}
                pathOptions={{ color, weight, opacity, lineJoin: "round", lineCap: "round" }}
              >
                <FeaturePopup properties={properties} fallback={`Route ${index + 1}`} kind="route" />
              </Polyline>
            ))
          })}

      {showZones &&
        features
          .filter((feature) => ["Polygon", "MultiPolygon"].includes(feature.geometry?.type || ""))
          .flatMap((feature, index) => {
            const properties = feature.properties || {}
            const positions = polygonPositions(feature.geometry)
            const color = properties.stroke || "#59344e"
            const fillColor = properties.fill || "#f2dfb6"
            const weight = Math.max(Number(properties.strokeWidth || 1), 1)
            const opacity = properties.strokeOpacity ?? 0.7
            const fillOpacity = properties.fillOpacity ?? 0.22

            return positions.map((positionSet, subIndex) => (
              <Polygon
                key={`zone-${url}-${index}-${subIndex}`}
                positions={positionSet as any}
                pathOptions={{ color, fillColor, weight, opacity, fillOpacity }}
              >
                <FeaturePopup properties={properties} fallback={`Zone ${index + 1}`} kind="zone" />
              </Polygon>
            ))
          })}
    </>
  )
}
