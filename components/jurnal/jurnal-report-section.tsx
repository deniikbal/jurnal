"use client"

import { useState } from "react"

import { ClipboardListIcon } from "lucide-react"
import { DataPagination } from "@/components/data-pagination"
import { JournalDeleteButton } from "@/components/journal-delete-button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Classroom, Journal } from "@/components/jurnal-page-client"

const PAGE_SIZE = 10

type Props = {
  journals: Journal[]
  classrooms: Classroom[]
}

export function JurnalReportSection({ journals, classrooms }: Props) {
  const [classroomId, setClassroomId] = useState("all")
  const [page, setPage] = useState(0)

  const sortedClassrooms = [...classrooms].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  )

  const rows = journals
    .filter((j) => classroomId === "all" || j.classroomId === classroomId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.jamKe - b.jamKe)

  const totalPages = Math.max(Math.ceil(rows.length / PAGE_SIZE), 1)
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Laporan jurnal
            </h2>
            <p className="text-xs text-muted-foreground">
              {rows.length} entri tercatat
            </p>
          </div>
          <Select
            value={classroomId}
            onValueChange={(value) => {
              setClassroomId(value)
              setPage(0)
            }}
          >
            <SelectTrigger
              className="h-9 w-full text-sm shadow-none sm:w-44"
              aria-label="Filter kelas laporan"
            >
              <SelectValue placeholder="Semua kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kelas</SelectItem>
              {sortedClassrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 pl-5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  No
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Tanggal
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Mapel
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Kelas
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Jam
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Materi
                </TableHead>
                <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Kegiatan
                </TableHead>
                <TableHead className="w-16 pr-5 text-right text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length > 0 ? (
                pageRows.map((journal, index) => (
                  <TableRow key={journal.id} className="group">
                    <TableCell className="pl-5 text-xs text-muted-foreground tabular-nums">
                      {safePage * PAGE_SIZE + index + 1}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-foreground tabular-nums">
                      {journal.date}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {journal.subjectName}
                      {journal.subjectKode ? (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          ({journal.subjectKode})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {journal.classroomName}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                      {journal.jamKe} · {journal.startTime}–{journal.endTime}
                    </TableCell>
                    <TableCell className="max-w-[12rem] truncate text-xs text-muted-foreground">
                      {journal.materi}
                    </TableCell>
                    <TableCell className="max-w-[12rem] truncate text-xs text-muted-foreground">
                      {journal.kegiatan}
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end">
                        <JournalDeleteButton
                          id={journal.id}
                          title={journal.subjectName}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="h-40">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ClipboardListIcon />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada jurnal tercatat.</EmptyTitle>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="divide-y divide-border sm:hidden">
          {pageRows.length > 0 ? (
            pageRows.map((journal) => (
              <div key={journal.id} className="space-y-2 px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {journal.subjectName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {journal.date}
                      <span className="mx-1.5 text-border">·</span>
                      {journal.classroomName}
                      <span className="mx-1.5 text-border">·</span>
                      Jam {journal.jamKe} ({journal.startTime}–{journal.endTime}
                      )
                    </p>
                  </div>
                  <JournalDeleteButton
                    id={journal.id}
                    title={journal.subjectName}
                  />
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="text-foreground/70">Materi:</span>{" "}
                    {journal.materi}
                  </p>
                  <p>
                    <span className="text-foreground/70">Kegiatan:</span>{" "}
                    {journal.kegiatan}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <Empty className="mx-4 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardListIcon />
                </EmptyMedia>
                <EmptyTitle>Belum ada jurnal tercatat.</EmptyTitle>
                <EmptyDescription>
                  Isi jurnal lewat tab Input Jurnal agar laporan terbentuk.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 sm:px-5">
            <p className="text-xs text-muted-foreground">
              Menampilkan {safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, rows.length)} dari{" "}
              {rows.length} entri
            </p>
            <DataPagination
              page={safePage + 1}
              totalPages={totalPages}
              onPageChange={(next) => setPage(next - 1)}
              className="justify-end"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
