import type { Metadata } from "next"
import { DM_Sans, IBM_Plex_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

// Body: DM Sans. Humanist sans, jelas di ukuran kecil, tidak berkarakter
// "techy". Cocok untuk aplikasi internal yang dipakai guru tiap hari
// (DESIGN.md: modern profesional, simple).
// Mono: IBM Plex Mono. Dipakai untuk NIS, kode mapel, dan jam. Karakter
// slab-nya membantu scanning angka dibanding Geist/JetBrains Mono yang
// terlalu "developer aesthetic" untuk konteks sekolah.
const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Jurnal",
    template: "%s | Jurnal",
  },
  description: "Aplikasi jurnal kesiswaan dengan login Google.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} antialiased`}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
