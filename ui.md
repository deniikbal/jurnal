# Standar UI Halaman Dashboard

Halaman `app/dashboard/kelas/page.tsx` menjadi acuan utama untuk membuat halaman dashboard baru.

## Struktur halaman

Gunakan urutan layout seperti halaman Kelas:

1. Header halaman
2. Kartu ringkasan/statistik
3. Card utama berisi toolbar, filter, tabel, dan pagination
4. Modal untuk aksi tambahan/detail data

Contoh struktur:

```tsx
return (
  <>
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Judul</h1>
      <p className="text-sm text-muted-foreground">Deskripsi singkat halaman.</p>
    </div>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card statistik */}
    </section>

    <Card>
      <CardHeader className="gap-4">
        {/* Judul card, deskripsi, tombol tambah */}
        {/* Filter */}
      </CardHeader>
      <CardContent>
        {/* Table + Pagination */}
      </CardContent>
    </Card>
  </>
)
```

## Header halaman

- Judul memakai:

```tsx
<h1 className="text-2xl font-semibold tracking-tight">...</h1>
```

- Deskripsi memakai:

```tsx
<p className="text-sm text-muted-foreground">...</p>
```

## Card statistik

Gunakan grid:

```tsx
<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
```

Card statistik memakai pola:

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Label Statistik
    </CardTitle>
    <Icon className="size-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-semibold">0</p>
  </CardContent>
</Card>
```

## Card utama

Gunakan:

```tsx
<Card>
  <CardHeader className="gap-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <CardTitle>Daftar Data</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cari, urutkan, dan lihat data dengan pagination.
        </p>
      </div>
      <CreateDialog />
    </div>
    <FilterComponent />
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

## Filter dan sorting

- Search memakai `Input` dengan icon search di kiri.
- Filter/sort memakai `NativeSelect`.
- Default sort adalah **Natural**.
- Natural sort memakai `Intl.Collator`:

```tsx
const naturalCollator = new Intl.Collator("id-ID", {
  numeric: true,
  sensitivity: "base",
})
```

Sorting natural:

```tsx
items.sort((a, b) => naturalCollator.compare(a.name, b.name))
```

## Tabel

Tabel wajib memakai komponen UI:

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-16">No</TableHead>
      <TableHead>Nama</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="w-40 text-right">Aksi</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>...</TableBody>
</Table>
```

Wrapper tabel:

```tsx
<div className="overflow-hidden rounded-lg border">
```

Jika data kosong:

```tsx
<TableRow>
  <TableCell colSpan={JUMLAH_KOLOM} className="h-32 text-center text-muted-foreground">
    Tidak ada data.
  </TableCell>
</TableRow>
```

## Kolom aksi

- Kolom aksi berada paling kanan.
- Header memakai:

```tsx
<TableHead className="w-40 text-right">Aksi</TableHead>
```

- Isi memakai:

```tsx
<TableCell>
  <div className="flex justify-end">
    <ActionsComponent item={item} />
  </div>
</TableCell>
```

- Aksi standar: **Edit** dan **Hapus**.
- Edit memakai `Dialog`.
- Hapus memakai `AlertDialog`.

## Modal create/edit/detail

Gunakan `Dialog` untuk:

- Tambah data
- Edit data
- Detail data seperti daftar siswa dalam kelas

Pola modal form:

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Tambah Data</Button>
  </DialogTrigger>
  <DialogContent>
    <form action={formAction} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Tambah Data</DialogTitle>
        <DialogDescription>Deskripsi aksi.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        {/* Field */}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Batal</Button>
        </DialogClose>
        <Button type="submit">Simpan</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

## Notifikasi

- Semua create/update/delete wajib memakai `sonner`.
- Berhasil memakai:

```tsx
toast.success("Data berhasil disimpan")
```

- Gagal memakai:

```tsx
toast.error("Data gagal disimpan")
```

- Setelah create/update berhasil, modal harus otomatis close.

## Server action

Server action harus mengembalikan state standar:

```ts
export type ActionState = {
  success: boolean
  message: string
}
```

Contoh:

```ts
return {
  success: true,
  message: "Data berhasil ditambahkan",
}
```

Di client gunakan `useActionState`, lalu tampilkan toast berdasarkan state.

## Pagination

Gunakan komponen pagination UI seperti halaman Kelas:

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious text="Sebelumnya" href="..." />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext text="Berikutnya" href="..." />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

Tampilkan info jumlah data:

```tsx
<p className="text-sm text-muted-foreground">
  Menampilkan 1-10 dari 100 data
</p>
```

## Detail data relasi

Jika menampilkan data relasi dari tabel, gunakan modal, bukan pindah halaman, kecuali halaman tersebut memang fitur utama.

Contoh: kolom `Total Siswa` di halaman Kelas membuka modal daftar siswa di kelas tersebut.

## File referensi

Gunakan file berikut sebagai referensi implementasi:

- `app/dashboard/kelas/page.tsx`
- `components/kelas-filter.tsx`
- `components/kelas-create-dialog.tsx`
- `components/kelas-actions.tsx`
- `components/kelas-siswa-dialog.tsx`
- `lib/kelas-actions.ts`
