import { Skeleton } from "@/components/ui/skeleton"

function HeaderStatSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-card px-4 py-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-10" />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <Skeleton className="h-3 w-5 shrink-0" />
      <Skeleton className="h-3.5 flex-1 max-w-[14rem]" />
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="h-3.5 w-14" />
      <Skeleton className="h-6 w-14" />
    </div>
  )
}

function CardRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  )
}

export default function SubjectLoading() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat daftar mata pelajaran…</span>

      <div className="space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-3.5 w-72" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:max-w-md">
        <HeaderStatSkeleton />
        <HeaderStatSkeleton />
      </div>

      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>

        <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <Skeleton className="h-9 flex-1" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:flex sm:shrink-0">
              <Skeleton className="h-9 w-full lg:w-[8.5rem]" />
              <Skeleton className="h-9 w-full lg:w-[8.5rem]" />
              <Skeleton className="h-9 w-full lg:w-[5.5rem]" />
            </div>
          </div>
        </div>

        <div className="hidden sm:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border-b border-border last:border-b-0"
            >
              <TableRowSkeleton />
            </div>
          ))}
        </div>

        <div className="divide-y divide-border sm:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardRowSkeleton key={i} />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
      </section>
    </div>
  )
}
