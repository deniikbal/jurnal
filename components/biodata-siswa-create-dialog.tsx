"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { createBiodataSiswa, type BiodataSiswaActionState } from "@/lib/biodata-siswa-actions"
import { getDriveImageUrl } from "@/lib/google-drive"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const initialState: BiodataSiswaActionState = { success: false, message: "" }

export function BiodataSiswaCreateDialog() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createBiodataSiswa, initialState)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Biodata</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form ref={formRef} action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Tambah Biodata Siswa</DialogTitle>
            <DialogDescription>
              Masukkan data biodata siswa.
            </DialogDescription>
          </DialogHeader>

          <BiodataSiswaFormFields disabled={isPending} />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function BiodataSiswaFormFields({
  disabled,
  defaultValues,
  editableNama = true,
}: {
  disabled?: boolean
  defaultValues?: {
    nama?: string
    alamat?: string
    nohpOrtu?: string
    namaAyah?: string
    namaIbu?: string
    statusPernikahan?: string
    kondisiKeluarga?: string
    fotoRumah?: string
  }
  editableNama?: boolean
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="nama">Nama Siswa</Label>
        <Input
          id="nama"
          name="nama"
          defaultValue={defaultValues?.nama ?? ""}
          placeholder="Nama lengkap siswa"
          required
          autoFocus={editableNama}
          disabled={disabled || !editableNama}
          readOnly={!editableNama}
          tabIndex={editableNama ? 0 : -1}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="alamat">Alamat</Label>
        <Textarea
          id="alamat"
          name="alamat"
          defaultValue={defaultValues?.alamat ?? ""}
          placeholder="Alamat lengkap"
          disabled={disabled}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="nohp_ortu">No. HP Orang Tua</Label>
        <Input
          id="nohp_ortu"
          name="nohp_ortu"
          defaultValue={defaultValues?.nohpOrtu ?? ""}
          placeholder="Contoh: 081234567890"
          disabled={disabled}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="nama_ayah">Nama Ayah</Label>
        <Input
          id="nama_ayah"
          name="nama_ayah"
          defaultValue={defaultValues?.namaAyah ?? ""}
          placeholder="Nama ayah"
          disabled={disabled}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="nama_ibu">Nama Ibu</Label>
        <Input
          id="nama_ibu"
          name="nama_ibu"
          defaultValue={defaultValues?.namaIbu ?? ""}
          placeholder="Nama ibu"
          disabled={disabled}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="status_pernikahan">Status Pernikahan Orang Tua</Label>
        <Select
          name="status_pernikahan"
          defaultValue={defaultValues?.statusPernikahan ?? ""}
          disabled={disabled}
        >
          <SelectTrigger id="status_pernikahan" className="w-full">
            <SelectValue placeholder="Pilih status pernikahan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Menikah">Menikah</SelectItem>
            <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
            <SelectItem value="Cerai Meninggal">Cerai Meninggal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="kondisi_keluarga">Kondisi Keluarga (Opsional)</Label>
        <Select
          name="kondisi_keluarga"
          defaultValue={defaultValues?.kondisiKeluarga ?? ""}
          disabled={disabled}
        >
          <SelectTrigger id="kondisi_keluarga" className="w-full">
            <SelectValue placeholder="Pilih kondisi keluarga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Anak Yatim">Anak Yatim</SelectItem>
            <SelectItem value="Anak Piatu">Anak Piatu</SelectItem>
            <SelectItem value="Anak Yatim Piatu">Anak Yatim Piatu</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="foto_rumah">Foto Rumah</Label>
        <Input
          id="foto_rumah"
          name="foto_rumah"
          type="file"
          accept="image/*"
          disabled={disabled}
        />
        {defaultValues?.fotoRumah && (
          <>
            <input type="hidden" name="existing_foto" value={defaultValues.fotoRumah} />
            <div className="mt-1 overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getDriveImageUrl(defaultValues.fotoRumah) ?? ""}
                alt="Foto rumah saat ini"
                className="h-32 w-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Biarkan kosong jika tidak ingin mengubah foto.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
