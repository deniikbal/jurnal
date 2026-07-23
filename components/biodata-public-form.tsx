"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { ArrowLeftIcon, CheckCircleIcon, SearchIcon } from "lucide-react"

import {
  lookupSiswaByNis,
  saveBiodataPublic,
  type BiodataPublicState,
} from "@/lib/biodata-public-actions"
import { BiodataSiswaFormFields } from "@/components/biodata-siswa-create-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: BiodataPublicState = { success: false, message: "" }

export function BiodataPublicForm() {
  const [step, setStep] = useState<"nis" | "biodata" | "done">("nis")
  const [studentName, setStudentName] = useState("")
  const [studentNis, setStudentNis] = useState("")

  const [lookupState, lookupAction, lookupPending] = useActionState(
    lookupSiswaByNis,
    initialState,
  )

  const [saveState, saveAction, savePending] = useActionState(
    saveBiodataPublic,
    initialState,
  )

  useEffect(() => {
    if (lookupState === initialState) return

    if (lookupState.success) {
      setStudentName(lookupState.student?.name ?? "")
      setStudentNis(lookupState.student?.nis ?? "")
      setStep("biodata")
    } else {
      toast.error(lookupState.message)
    }
  }, [lookupState])

  useEffect(() => {
    if (!saveState.message) return

    if (saveState.success) {
      toast.success(saveState.message)
      setStep("done")
    } else {
      toast.error(saveState.message)
    }
  }, [saveState])

  if (step === "done") {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircleIcon className="size-7 text-emerald-600" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Biodata Tersimpan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Terima kasih, data biodata kamu sudah disimpan.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setStep("nis")
            setStudentName("")
            setStudentNis("")
          }}
        >
          Isi Biodata Lain
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {step === "nis" ? (
        <form action={lookupAction} className="p-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="nis">Masukkan NIS</Label>
              <p className="text-xs text-muted-foreground">
                NIS digunakan untuk memverifikasi data kamu.
              </p>
            </div>
            <Input
              id="nis"
              name="nis"
              placeholder="Contoh: 12345"
              required
              autoFocus
              disabled={lookupPending}
            />
            <Button type="submit" className="w-full" disabled={lookupPending}>
              {lookupPending ? (
                "Mencari..."
              ) : (
                <>
                  <SearchIcon className="size-4" />
                  Cari Data Saya
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <form action={saveAction} className="p-6">
          <input type="hidden" name="nis" value={studentNis} />

          <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
              {studentName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{studentName}</p>
              <p className="text-xs text-muted-foreground">NIS: {studentNis}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="ml-auto"
              onClick={() => setStep("nis")}
              disabled={savePending}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
          </div>

          <BiodataSiswaFormFields
            disabled={savePending}
            editableNama={false}
            defaultValues={{
              nama: studentName,
              alamat: lookupState.biodata?.alamat ?? "",
              nohpOrtu: lookupState.biodata?.nohpOrtu ?? "",
              namaAyah: lookupState.biodata?.namaAyah ?? "",
              namaIbu: lookupState.biodata?.namaIbu ?? "",
              statusPernikahan: lookupState.biodata?.statusPernikahan ?? "",
              kondisiKeluarga: lookupState.biodata?.kondisiKeluarga ?? "",
            }}
          />

          <Button type="submit" className="mt-4 w-full" disabled={savePending}>
            {savePending ? "Menyimpan..." : "Simpan Biodata"}
          </Button>
        </form>
      )}
    </div>
  )
}
