"use client"

import { useState } from "react"
import { EyeIcon, HomeIcon, ImageOffIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getDriveImageUrl } from "@/lib/google-drive"

type BiodataFotoPreviewProps = {
  fotoRumah: string
  nama: string
}

export function BiodataFotoPreview({ fotoRumah, nama }: BiodataFotoPreviewProps) {
  const [open, setOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imageUrl = getDriveImageUrl(fotoRumah) ?? ""

  if (hasError || !imageUrl) {
    return (
      <div
        className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-sm border bg-muted/40 text-muted-foreground"
        title="Foto tidak dapat dimuat"
      >
        <HomeIcon className="size-4" />
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group relative flex size-10 sm:size-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border bg-muted/30 transition-all hover:ring-2 hover:ring-primary/50 focus:outline-hidden cursor-pointer"
          title="Klik untuk melihat foto lebih besar"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Foto rumah ${nama}`}
            className="size-full object-cover transition-transform duration-200 group-hover:scale-110"
            onError={() => setHasError(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <EyeIcon className="size-4 text-white" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-xl p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base sm:text-lg truncate">Foto Rumah - {nama}</DialogTitle>
          <DialogDescription className="sr-only">Tampilan foto rumah siswa {nama}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 relative overflow-hidden rounded-sm border bg-black/5 flex items-center justify-center p-1 min-h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Foto rumah ${nama}`}
            className="max-h-[70vh] w-full object-contain rounded-sm shadow-md"
            onError={() => setHasError(true)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

