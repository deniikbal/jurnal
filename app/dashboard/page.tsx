import type { Metadata } from "next"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, getKelasForCurrentUser, getSiswaForCurrentUser } from "@/lib/dal"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const [user, daftarKelas, daftarSiswa] = await Promise.all([
    getCurrentUser(),
    getKelasForCurrentUser(),
    getSiswaForCurrentUser(),
  ])

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Selamat datang, {user?.name ?? user?.email}
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola data kelas, siswa, dan jurnal sesuai akun Google yang sedang login.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{daftarKelas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Siswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{daftarSiswa.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold capitalize">{user?.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">Aktif</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Fondasi multi-user sudah siap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Data kelas, siswa, dan jurnal difilter menggunakan userId dari session login.
            Nanti saat form tambah data dibuat, userId akan diambil dari server session,
            bukan dari input frontend.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
