import type { Metadata } from "next"
import Link from "next/link"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Beranda",
}

export default async function Page() {
  const session = await auth()

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="flex max-w-xl flex-col gap-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">Jurnal</h1>
          <p className="text-muted-foreground">
            Aplikasi jurnal publik dengan login Google. Data kelas, siswa, dan jurnal
            akan terpisah sesuai user yang login.
          </p>
        </div>
        <div>
          <Button asChild>
            <Link href={session?.user ? "/dashboard" : "/login"}>
              {session?.user ? "Buka Dashboard" : "Login dengan Google"}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
