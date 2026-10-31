import type { Metadata } from "next"
import { Poppins, Roboto_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Sans: Poppins, sesuai preset shadcn (b7BFgTjiC) yang menetapkan
// --font-sans: Poppins di globals.css. Dimuat lewat next/font supaya
// variabel --font-sans di html menimpa fallback di :root.
// Mono: Roboto Mono, dipakai untuk NIS, kode mapel, dan jam.
const fontSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

const fontMono = Roboto_Mono({
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
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        "font-sans"
      )}
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
