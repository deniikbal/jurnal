"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"

import { deleteJournal, type JournalActionState } from "@/lib/journal-actions"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

const initialState: JournalActionState = { success: false, message: "" }

export function JournalDeleteButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(deleteJournal, initialState)

  useEffect(() => {
    if (!state.message) return

    if (state.success) {
      toast.success(state.message)
      setOpen(false)
    } else {
      toast.error(state.message)
    }
  }, [state])

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="icon-sm">
          <Trash2Icon />
          <span className="sr-only">Hapus</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={id} />
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus jurnal?</AlertDialogTitle>
            <AlertDialogDescription>
              Jurnal <span className="font-medium text-foreground">{title}</span> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Batal
            </AlertDialogCancel>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
