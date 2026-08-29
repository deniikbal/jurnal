import { Skeleton } from "@/components/ui/skeleton"

function FilterSkeleton() {
  return (
    <div className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="grid gap-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="!h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="!h-9 w-full" />
        </div>
        <div className="grid gap-1.5 sm:w-40">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="!h-9 w-full" />
        </div>
        <div className="grid flex-1 gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="!h-9 w-full" />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-3 w-5" />
              <Skeleton className="h-3.5 flex-1 max-w-[16rem]" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PenilaianLoading() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat halaman penilaian…</span>

      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3.5 w-96 max-w-full" />
      </div>

      <FilterSkeleton />
      <FormSkeleton />
    </div>
  )
}
