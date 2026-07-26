"use client"

import { UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SiswaItem = {
  id: string
  name: string
  nis: string | null
}

type KelasSiswaDialogProps = {
  kelasName: string
  siswa: SiswaItem[]
}

const naturalCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
})

export function KelasSiswaDialog({ kelasName, siswa }: KelasSiswaDialogProps) {
  const sortedSiswa = siswa.toSorted((a, b) =>
    naturalCollator.compare(a.name, b.name),
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="link" className="h-auto p-0">
          <UsersIcon className="size-3.5" />
          {siswa.length} siswa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-2xl p-4 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base sm:text-lg">Siswa Kelas {kelasName}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Total siswa di kelas ini: {siswa.length}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>NIS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSiswa.length > 0 ? (
                sortedSiswa.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.nis ?? "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                    Belum ada siswa di kelas ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
