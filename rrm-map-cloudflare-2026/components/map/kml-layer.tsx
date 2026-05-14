"use client"

import { useState, useEffect } from "react"
import { Marker, Popup, Polyline, Polygon, useMap } from "react-leaflet"
import L from "leaflet"
import { parseKML } from "@/lib/kml-parser"
import { Loader2 } from "lucide-react"

interface KMLLayerProps {
  url: string
  showRoutes?: boolean
  showZones?: boolean
  showPOIs?: boolean
}

export default function KMLLayer({ url, showRoutes = true, showZones = true, showPOIs = true }: KMLLayerProps) {
  const [kmlData, setKmlData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const map = useMap()

  useEffect(() => {
    const loadKML = async () => {
      try {
        setLoading(true)
        const data = await parseKML(url)
        setKmlData(data)
        setError(null)

        // Fit map to KML data bounds after loading
        if (data && data.features && data.features.length > 0) {
          const bounds = L.latLngBounds([])

          data.features.forEach((feature: any) => {
            if (feature.geometry.type === "Point") {
              const [lng, lat] = feature.geometry.coordinates
              bounds.extend([lat, lng])
            } else if (feature.geometry.type === "LineString") {
              feature.geometry.coordinates.forEach((coord: number[]) => {
                bounds.extend([coord[1], coord[0]])
              })
            } else if (feature.geometry.type === "Polygon") {
              feature.geometry.coordinates[0].forEach((coord: number[]) => {
                bounds.extend([coord[1], coord[0]])
              })
            }
          })

          if (bounds.isValid()) {
            // Add padding to ensure all elements are visible
            map.fitBounds(bounds, { padding: [50, 50] })
          }
        }
      } catch (err) {
        console.error("Error loading KML:", err)
        setError("Failed to load KML data")
      } finally {
        setLoading(false)
      }
    }

    loadKML()
  }, [url, map])

  if (loading) {
    return (
      <div className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/80 p-3 shadow-md">
        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="absolute left-1/2 top-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/90 p-3 text-sm text-red-500 shadow-md">
        Error loading map data
      </div>
    )
  }

  if (!kmlData) return null

  // Render the KML features
  return (
    <>
      {/* Render Points (Placemarks) */}
      {showPOIs &&
        kmlData.features
          .filter((feature: any) => feature.geometry.type === "Point")
          .map((feature: any, index: number) => {
            const coordinates = feature.geometry.coordinates
            const properties = feature.properties || {}

            // Extract icon information if available
            let icon = null
            if (properties.icon) {
              icon = L.icon({
                iconUrl: properties.icon,
                iconSize: [24, 24], // Smaller icons
                iconAnchor: [12, 12], // Center the icon
                popupAnchor: [0, -12], // Position popup above the icon
              })
            }

            return (
              <Marker
                key={`poi-${index}`}
                position={[coordinates[1], coordinates[0]]}
                icon={icon || undefined}
                // Add proper ARIA attributes for accessibility
                eventHandlers={{
                  add: (e) => {
                    // Ensure marker elements don't inherit aria-hidden
                    const el = e.target.getElement()
                    if (el) {
                      el.setAttribute("aria-hidden", "false")
                      el.setAttribute("role", "img")
                      el.setAttribute("aria-label", properties.name || `Point of interest ${index + 1}`)
                    }
                  },
                }}
              >
                <Popup className="centered-popup">
                  <div className="custom-popup-content">
                    <h3>{properties.name || `Point ${index + 1}`}</h3>
                    {properties.description && <div dangerouslySetInnerHTML={{ __html: properties.description }} />}
                  </div>
                </Popup>
              </Marker>
            )
          })}

      {/* Render LineStrings (Routes) */}
      {showRoutes &&
        kmlData.features
          .filter((feature: any) => feature.geometry.type === "LineString")
          .map((feature: any, index: number) => {
            const coordinates = feature.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]])
            const properties = feature.properties || {}

            // Extract style information if available
            const color = properties.stroke || "#64748b"
            const weight = properties.strokeWidth || 3 // Slightly thinner lines
            const opacity = properties.strokeOpacity || 0.8

            return (
              <Polyline
                key={`route-${index}`}
                positions={coordinates}
                pathOptions={{
                  color,
                  weight,
                  opacity,
                  lineJoin: "round",
                }}
              >
                <Popup className="centered-popup">
                  <div className="custom-popup-content">
                    <h3>{properties.name || `Route ${index + 1}`}</h3>
                    {properties.description && <div dangerouslySetInnerHTML={{ __html: properties.description }} />}
                  </div>
                </Popup>
              </Polyline>
            )
          })}

      {/* Render Polygons (Zones) */}
      {showZones &&
        kmlData.features
          .filter((feature: any) => feature.geometry.type === "Polygon")
          .map((feature: any, index: number) => {
            // Convert coordinates format for Leaflet
            const coordinates = feature.geometry.coordinates.map((ring: number[][]) =>
              ring.map((coord: number[]) => [coord[1], coord[0]]),
            )
            const properties = feature.properties || {}

            // Extract style information if available
            const color = properties.stroke || "#64748b"
            const fillColor = properties.fill || "rgba(100, 116, 139, 0.3)"
            const weight = properties.strokeWidth || 1 // Thinner borders
            const opacity = properties.strokeOpacity || 0.7
            const fillOpacity = properties.fillOpacity || 0.2 // More subtle fill

            return (
              <Polygon
                key={`zone-${index}`}
                positions={coordinates}
                pathOptions={{
                  color,
                  fillColor,
                  weight,
                  opacity,
                  fillOpacity,
                }}
              >
                <Popup className="centered-popup">
                  <div className="custom-popup-content">
                    <h3>{properties.name || `Zone ${index + 1}`}</h3>
                    {properties.description && <div dangerouslySetInnerHTML={{ __html: properties.description }} />}
                  </div>
                </Popup>
              </Polygon>
            )
          })}
    </>
  )
}
