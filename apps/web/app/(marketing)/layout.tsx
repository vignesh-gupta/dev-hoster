import { Archivo, JetBrains_Mono } from "next/font/google"
import "./landing.css"

// Freight-signage display face (variable width + weight) and a plain mono for logs.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
})
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jb",
  display: "swap",
})

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`landing ${archivo.variable} ${jetbrains.variable}`}>
      {children}
    </div>
  )
}
