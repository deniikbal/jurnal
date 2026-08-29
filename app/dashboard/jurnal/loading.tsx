import { Skeleton } from "@/components/ui/skeleton"

function HeaderStatSkeleton({ emphasis = false }: { emphasis?: boolean }) {
  return (
    <div
      className={
        emphasis
          ? "rounded-md border border-primary/20 bg-primary/5 px-4 py-3"
          : "rounded-md border border-border bg-card px-4 py-3"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton className={emphasis ? "h-3 w-20 bg-primary/15" : "h-3 w-20"} />
        <Skeleton className="size-3.5" />
      </div>
      <Skeleton
        className={
          emphasis
            ? "mt-1 h-7 w-12 bg-primary/15"
            : "mt-1 h-6 w-12"
        }
      />
      <Skeleton className="mt-1.5 h-3 w-24" />
    </div>
  )
}

function ProgressSectionSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-col gap-4 px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-1.5 w-full" />
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-14 rounded-md" />
          ))}
          <div className="ml-auto">
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
      </div>
    </div>
  )
}

function TabsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-9 w-fit items-center gap-1 rounded-sm bg-muted p-[3px]">
        <Skeleton className="h-7 w-24 rounded-sm" />
        <Skeleton className="h-7 w-20 rounded-sm" />
        <Skeleton className="h-7 w-24 rounded-sm" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border bg-card px-4 py-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function JurnalLoading() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Memuat data jurnal…</span>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3.5 w-96 max-w-full" />
        </div>
        <div className="space-y-1.5 sm:items-end sm:text-right">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-28 sm:ml-auto" />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <HeaderStatSkeleton emphasis />
        <HeaderStatSkeleton />
        <HeaderStatSkeleton />
        <HeaderStatSkeleton />
      </dl>

      <ProgressSectionSkeleton />
      <TabsSkeleton />
    </div>
  )
}
