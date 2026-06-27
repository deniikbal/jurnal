"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getStoredTheme(): Theme {
  const theme = window.localStorage.getItem("theme")
  return theme === "light" || theme === "dark" || theme === "system"
    ? theme
    : "system"
}

function applyTheme(theme: Theme) {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    function syncTheme() {
      applyTheme(getStoredTheme())
    }

    syncTheme()
    mediaQuery.addEventListener("change", syncTheme)
    window.addEventListener("storage", syncTheme)

    return () => {
      mediaQuery.removeEventListener("change", syncTheme)
      window.removeEventListener("storage", syncTheme)
    }
  }, [])

  return (
    <>
      <ThemeHotkey />
      {children}
    </>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (typeof event.key !== "string") return
      if (event.key.toLowerCase() !== "d") return
      if (isTypingTarget(event.target)) return

      const currentTheme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light"
      const nextTheme = currentTheme === "dark" ? "light" : "dark"

      window.localStorage.setItem("theme", nextTheme)
      applyTheme(nextTheme)
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return null
}

export { ThemeProvider }
