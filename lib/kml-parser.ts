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
    processPlacemarkContent(kml, geoJSON)

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

function processPlacemarkContent(kml: Document, geoJSON: any) {
  const placemarks = Array.from(kml.getElementsByTagName("Placemark")).filter(placemarkHasGeometry)
  let placemarkIndex = 0

  geoJSON.features?.forEach((feature: any) => {
    if (!feature.properties) feature.properties = {}

    const placemark = placemarks[placemarkIndex]
    placemarkIndex += 1

    if (!placemark) return

    const meta = extractPlacemarkMeta(placemark)

    if (meta.name) feature.properties.name = meta.name
    if (meta.description) feature.properties.description = meta.description
    if (meta.images.length) feature.properties.images = meta.images
    if (meta.images.length || meta.description) feature.properties.hasExtraContent = true
  })
}

function placemarkHasGeometry(placemark: Element) {
  return Boolean(
    placemark.getElementsByTagName("Point")[0] ||
      placemark.getElementsByTagName("LineString")[0] ||
      placemark.getElementsByTagName("Polygon")[0] ||
      placemark.getElementsByTagName("MultiGeometry")[0],
  )
}

function extractPlacemarkMeta(placemark: Element) {
  const name = directChildText(placemark, "name")
  const description = directChildText(placemark, "description")
  const imageElements = [
    ...Array.from(placemark.getElementsByTagName("gx:imageUrl")),
    ...Array.from(placemark.getElementsByTagNameNS("*", "imageUrl")),
  ]
  const images = imageElements
    .map((image) => image.textContent?.trim() || "")
    .filter(Boolean)
    .map(normalizeImageUrl)

  return {
    name,
    description: normalizeDescription(description),
    images: Array.from(new Set(images)),
  }
}

function directChildText(parent: Element, tagName: string) {
  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes[i]
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      if (element.localName === tagName || element.tagName === tagName) {
        return element.textContent?.trim() || ""
      }
    }
  }

  return ""
}

function normalizeDescription(value: unknown) {
  if (typeof value !== "string") return ""

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .trim()
}

function normalizeImageUrl(value: string) {
  return value.replace("{size}", "720").replace(/&amp;/g, "&")
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
