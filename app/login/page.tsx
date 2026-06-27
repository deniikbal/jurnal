import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { loginWithGoogle } from "@/lib/auth-actions"

export const metadata: Metadata = {
  title: "Login",
}

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Masuk ke Jurnal</h1>
          <p className="text-sm text-muted-foreground">
            Gunakan akun Google. Tidak perlu daftar user manual.
          </p>
        </div>
        <form action={loginWithGoogle}>
          <Button className="w-full" type="submit">
            Login dengan Google
          </Button>
        </form>
      </div>
    </main>
  )
}
