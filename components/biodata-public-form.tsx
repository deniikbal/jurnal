"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { ArrowLeftIcon } from "lucide-react"

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

const steps = [
  { id: "nis", label: "Verifikasi" },
  { id: "biodata", label: "Isi data" },
  { id: "done", label: "Selesai" },
] as const

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

  const stepIndex = steps.findIndex((s) => s.id === step)

  return (
    <div className="space-y-8">
      <ol className="flex items-center gap-2 text-xs sm:gap-3">
        {steps.map((item, index) => {
          const active = index === stepIndex
          const done = index < stepIndex
          return (
            <li key={item.id} className="flex items-center gap-2 sm:gap-3">
              {index > 0 && (
                <span
                  className={`hidden h-px w-6 sm:block ${done ? "bg-foreground/40" : "bg-border"}`}
                  aria-hidden
                />
              )}
              <span className="flex items-center gap-2">
                <span
                  className={`flex size-5 items-center justify-center rounded-full text-[10px] font-medium tabular-nums ${
                    active
                      ? "bg-foreground text-background"
                      : done
                        ? "bg-foreground/15 text-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {item.label}
                </span>
              </span>
            </li>
          )
        })}
      </ol>

      {step === "done" ? (
        <div className="space-y-6 border border-border px-5 py-8 sm:px-6">
          <div className="space-y-2">
            <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Berhasil
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Biodata tersimpan
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Data untuk{" "}
              <span className="font-medium text-foreground">{studentName}</span>{" "}
              (NIS {studentNis}) sudah dicatat. Silakan tutup halaman ini atau isi
              biodata siswa lain.
            </p>
          </div>
          <Button
            variant="outline"
            className="shadow-none"
            onClick={() => {
              setStep("nis")
              setStudentName("")
              setStudentNis("")
            }}
          >
            Isi biodata lain
          </Button>
        </div>
      ) : null}

      {step === "nis" ? (
        <form action={lookupAction} className="space-y-6 border border-border">
          <div className="space-y-1 border-b border-border px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-foreground">Verifikasi NIS</h2>
            <p className="text-xs text-muted-foreground">
              Masukkan NIS yang sama dengan data di sekolah.
            </p>
          </div>

          <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="space-y-2">
              <Label htmlFor="nis" className="text-xs font-medium">
                Nomor Induk Siswa (NIS)
              </Label>
              <Input
                id="nis"
                name="nis"
                placeholder="Contoh: 12345"
                required
                autoFocus
                disabled={lookupPending}
                className="h-10 border-border/80 bg-background font-mono text-sm shadow-none"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Jika NIS tidak ditemukan, hubungi wali kelas.
              </p>
              <Button
                type="submit"
                disabled={lookupPending}
                className="w-full shadow-none sm:w-auto"
              >
                {lookupPending ? "Mencari…" : "Lanjut"}
              </Button>
            </div>
          </div>
        </form>
      ) : null}

      {step === "biodata" ? (
        <form action={saveAction} className="space-y-0 border border-border">
          <input type="hidden" name="nis" value={studentNis} />

          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div className="min-w-0 space-y-0.5">
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Siswa terverifikasi
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {studentName}
              </p>
              <p className="font-mono text-xs text-muted-foreground">NIS {studentNis}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 text-xs text-muted-foreground"
              onClick={() => setStep("nis")}
              disabled={savePending}
            >
              <ArrowLeftIcon className="size-3.5" />
              Ganti NIS
            </Button>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">Data biodata</h2>
              <p className="text-xs text-muted-foreground">
                Lengkapi isian di bawah. Nama tidak dapat diubah dari form ini.
              </p>
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
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              onClick={() => setStep("nis")}
              disabled={savePending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={savePending} className="shadow-none">
              {savePending ? "Menyimpan…" : "Simpan biodata"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
