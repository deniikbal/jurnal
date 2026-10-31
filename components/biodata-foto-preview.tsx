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

export function BiodataFotoPreview({
  fotoRumah,
  nama,
}: BiodataFotoPreviewProps) {
  const [open, setOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imageUrl = getDriveImageUrl(fotoRumah) ?? ""

  if (hasError || !imageUrl) {
    return (
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-sm border bg-muted/40 text-muted-foreground sm:size-11"
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
          className="group relative flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm border bg-muted/30 transition-all hover:ring-2 hover:ring-primary/50 focus:outline-hidden sm:size-11"
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
      <DialogContent className="max-w-[calc(100vw-1.5rem)] overflow-hidden p-4 sm:max-w-xl sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="truncate text-base sm:text-lg">
            Foto Rumah - {nama}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Tampilan foto rumah siswa {nama}
          </DialogDescription>
        </DialogHeader>
        <div className="relative mt-2 flex min-h-48 items-center justify-center overflow-hidden rounded-sm border bg-black/5 p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Foto rumah ${nama}`}
            className="max-h-[70vh] w-full rounded-sm object-contain shadow-md"
            onError={() => setHasError(true)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
