import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Rimi Riga Marathon 2026 Map",
  description: "Interactive map for the Rimi Riga Marathon 2026 routes, points of interest, and key zones.",
  keywords: "Rimi Riga Marathon 2026, Riga Marathon map, marathon route, half marathon, 10 km, 6 km, DPD Mile",
  authors: [{ name: "Rimi Riga Marathon" }],
  openGraph: {
    title: "Rimi Riga Marathon 2026 Interactive Map",
    description: "Explore the Rimi Riga Marathon 2026 routes and key locations in Riga.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rimi Riga Marathon 2026 Map",
    description: "Interactive map for the Rimi Riga Marathon 2026 routes and points of interest.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/irp7ivx.css" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://rimirigamarathon.com/wp-content/themes/maratons2026/assets/images/misc/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://rimirigamarathon.com/wp-content/themes/maratons2026/assets/images/misc/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="https://rimirigamarathon.com/wp-content/themes/maratons2026/assets/images/misc/favicon-16x16.png" />
        <link rel="manifest" href="https://rimirigamarathon.com/wp-content/themes/maratons2026/assets/images/misc/site.webmanifest" />
        <link rel="mask-icon" href="https://rimirigamarathon.com/wp-content/themes/maratons2026/assets/images/misc/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="https://rimirigamarathon.com/wp-content/themes/maratons2026/assets/images/misc/favicon.ico" />
        <meta name="msapplication-TileColor" content="#dc2923" />
        <meta name="msapplication-config" content="https://rimirigamarathon.com/wp-content/themes/maratons2026/assets/images/misc/browserconfig.xml" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>{children}</body>
    </html>
  )
}
