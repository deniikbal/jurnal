"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (next: Theme) => void
  toggle: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "theme"
const DOM_ATTR = "data-theme-attr"

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system"
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system"
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

function applyDocumentTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.setAttribute(DOM_ATTR, resolved)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("light")

  React.useEffect(() => {
    const initial = readStoredTheme()
    const resolved = resolveTheme(initial)
    setThemeState(initial)
    setResolvedTheme(resolved)
    applyDocumentTheme(resolved)

    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const onSystemChange = () => {
      if (readStoredTheme() === "system") {
        const next = resolveTheme("system")
        setResolvedTheme(next)
        applyDocumentTheme(next)
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      const next = readStoredTheme()
      const resolvedNext = resolveTheme(next)
      setThemeState(next)
      setResolvedTheme(resolvedNext)
      applyDocumentTheme(resolvedNext)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (typeof event.key !== "string") return
      if (event.key.toLowerCase() !== "d") return

      const target = event.target
      if (target instanceof HTMLElement) {
        if (
          target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT"
        ) {
          return
        }
      }

      const current = readStoredTheme()
      const next: Theme = current === "dark" ? "light" : "dark"
      const resolvedNext = resolveTheme(next)
      window.localStorage.setItem(STORAGE_KEY, next)
      setThemeState(next)
      setResolvedTheme(resolvedNext)
      applyDocumentTheme(resolvedNext)
    }

    media.addEventListener("change", onSystemChange)
    window.addEventListener("storage", onStorage)
    window.addEventListener("keydown", onKeyDown)

    return () => {
      media.removeEventListener("change", onSystemChange)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const setTheme = React.useCallback((next: Theme) => {
    const resolvedNext = resolveTheme(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
    setResolvedTheme(resolvedNext)
    applyDocumentTheme(resolvedNext)
  }, [])

  const toggle = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>")
  }
  return ctx
}
