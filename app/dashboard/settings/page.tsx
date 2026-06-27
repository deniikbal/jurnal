import type { Metadata } from "next"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Pengaturan",
}

export default function SettingsPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Atur preferensi aplikasi dan akun.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Fitur pengaturan akan dibuat di tahap berikutnya.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
