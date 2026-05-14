import * as toGeoJSON from "@tmcw/togeojson"

export async function parseKML(url: string) {
  try {
    const response = await fetch(url, { cache: "force-cache" })
    if (!response.ok) {
      throw new Error(`KML request failed: ${response.status}`)
    }

    const kmlText = await response.text()
    const parser = new DOMParser()
    const kml = parser.parseFromString(kmlText, "text/xml")
    const parserError = kml.getElementsByTagName("parsererror")[0]

    if (parserError) {
      throw new Error("KML XML parse error")
    }

    const geoJSON = toGeoJSON.kml(kml)
    processStyles(kml, geoJSON)

    return geoJSON
  } catch (error) {
    console.error("Error parsing KML:", error)
    throw new Error("Failed to parse KML file")
  }
}

function processStyles(kml: Document, geoJSON: any) {
  const styles: Record<string, any> = {}
  const styleElements = kml.getElementsByTagName("Style")
  const styleMaps = kml.getElementsByTagName("StyleMap")

  for (let i = 0; i < styleElements.length; i++) {
    const style = styleElements[i]
    const styleId = style.getAttribute("id")

    if (styleId) {
      styles[`#${styleId}`] = extractStyleProperties(style)
    }
  }

  for (let i = 0; i < styleMaps.length; i++) {
    const styleMap = styleMaps[i]
    const styleMapId = styleMap.getAttribute("id")

    if (styleMapId) {
      const pairs = styleMap.getElementsByTagName("Pair")
      for (let j = 0; j < pairs.length; j++) {
        const pair = pairs[j]
        const key = pair.getElementsByTagName("key")[0]?.textContent
        const styleUrl = pair.getElementsByTagName("styleUrl")[0]?.textContent

        if (key === "normal" && styleUrl && styles[styleUrl]) {
          styles[`#${styleMapId}`] = { ...styles[styleUrl] }
        }
      }
    }
  }

  geoJSON.features?.forEach((feature: any) => {
    if (!feature.properties) feature.properties = {}

    const styleUrl = feature.properties.styleUrl
    if (styleUrl && styles[styleUrl]) {
      Object.assign(feature.properties, styles[styleUrl])
    }

    if (feature.properties.ExtendedData?.Data) {
      feature.properties.ExtendedData.Data.forEach((data: any) => {
        if (data.name === "icon" && data.value) {
          feature.properties.icon = data.value
        }
      })
    }
  })
}

function extractStyleProperties(styleElement: Element): Record<string, any> {
  const properties: Record<string, any> = {}

  const iconStyle = styleElement.getElementsByTagName("IconStyle")[0]
  if (iconStyle) {
    const href = iconStyle.getElementsByTagName("Icon")[0]?.getElementsByTagName("href")[0]
    if (href?.textContent) properties.icon = href.textContent

    const scale = iconStyle.getElementsByTagName("scale")[0]
    if (scale?.textContent) properties.iconScale = Number.parseFloat(scale.textContent)
  }

  const lineStyle = styleElement.getElementsByTagName("LineStyle")[0]
  if (lineStyle) {
    const color = lineStyle.getElementsByTagName("color")[0]
    if (color?.textContent) {
      properties.stroke = kmlColorToHex(color.textContent)
      properties.strokeOpacity = kmlColorToOpacity(color.textContent)
    }

    const width = lineStyle.getElementsByTagName("width")[0]
    if (width?.textContent) properties.strokeWidth = Number.parseFloat(width.textContent)
  }

  const polyStyle = styleElement.getElementsByTagName("PolyStyle")[0]
  if (polyStyle) {
    const color = polyStyle.getElementsByTagName("color")[0]
    if (color?.textContent) {
      properties.fill = kmlColorToHex(color.textContent)
      properties.fillOpacity = kmlColorToOpacity(color.textContent)
    }
  }

  return properties
}

function kmlColorToHex(kmlColor: string): string {
  if (kmlColor.length !== 8) return "#cc2328"

  const blue = kmlColor.substring(2, 4)
  const green = kmlColor.substring(4, 6)
  const red = kmlColor.substring(6, 8)

  return `#${red}${green}${blue}`
}

function kmlColorToOpacity(kmlColor: string): number {
  if (kmlColor.length !== 8) return 1
  return Number.parseInt(kmlColor.substring(0, 2), 16) / 255
}
