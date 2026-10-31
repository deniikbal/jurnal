# DESIGN

> Single source of truth untuk identitas visual produk Jurnal.
> Aturan antislop (`antislop.md`) jadi filter di atas direction ini.

## Identitas produk

- **Produk**: Jurnal, aplikasi internal kesiswaan untuk pencatatan jurnal
  mengajar, daftar siswa, nilai, dan kehadiran.
- **Audience primer**: guru dan wali kelas yang membuka aplikasi ini
  berulang kali setiap hari di laptop sekolah, dengan target task
  selesai dalam hitungan detik.
- **Audience sekunder**: staff kesiswaan yang mengelola data master
  (siswa, kelas, mapel).
- **Konteks penggunaan**: layar internal, sering dibuka dalam waktu lama,
  banyak data tabular, banyak angka yang harus di-scan cepat.

## Personality

- **Tenang**, bukan heboh. Tidak ada gradient, glow, animasi, atau
  micro-interaction yang tidak punya tujuan.
- **Jelas** di atas cantik. Hierarchy ditegakkan lewat tipografi dan
  whitespace, bukan lewat warna mencolok.
- **Akurat**. Angka dan label apa adanya, tidak dibumbui emoji atau
  jargon marketing.

## Palette

Basis: shadcn preset `b7BFgTjiC` (baseColor **mist**). Token didefinisikan
di `app/globals.css` dan itu satu-satunya sumber warna.

- **Primary (grafit)**: `oklch(0.218 0.008 223.9)` di light,
  `oklch(0.925 0.005 214.3)` di dark. Dipakai di tombol utama, focus
  ring, link aktif, dan satu aksen fokus per layar.
- **Foreground**: `oklch(0.148 0.004 228.8)` (light) /
  `oklch(0.987 0.002 197.1)` (dark). Untuk teks utama.
- **Muted**: `oklch(0.963 0.002 197.1)` untuk permukaan sekunder;
  `--muted-foreground` `oklch(0.56 0.021 213.5)` untuk label dan metadata.
- **Border**: `oklch(0.925 0.005 214.3)`. Kartu memakai
  `ring-1 ring-foreground/10`, bukan border tebal.
- **Aksen destruktif**: `oklch(0.577 0.245 27.325)` hanya untuk tombol
  hapus dan state error.
- **Aksen status**: emerald (hadir/aktif), amber (sakit), sky (izin),
  rose (alfa/keluar) — dipakai sebagai dot 6px, bukan blok warna. Bukan
  bagian palette utama.

Palette aktif maksimum: 2-3 core (primary + foreground + muted) + 1
accent. Sesuai R-29.

**Larangan**: `bg-secondary` / `bg-accent` bukan warna aksen. Di preset
mist keduanya nyaris putih, jadi jangan dipakai untuk membedakan kartu.
Bedakan lewat hierarki tipografi dan ring, bukan blok warna.

### Kode warna mapel

Enam hue tetap (`--subject-1` … `--subject-6` di `app/globals.css`) untuk
memberi identitas visual pada tiap mata pelajaran.

- **Tujuan**: guru memindai daftar sesi untuk menemukan satu mapel. Warna
  membuat baris bisa dikenali sebelum labelnya dibaca.
- **Batas**: warna ini **hanya** muncul sebagai penanda mapel — garis tepi
  3px, chip kode, dan wash saat hover. Tidak dipakai untuk tombol, border
  umum, background halaman, atau heading.
- **Kenapa tidak melanggar R-29**: ini pengkodean data (kategorikal),
  sederajat dengan warna seri pada grafik, bukan accent dekoratif. Chrome
  UI tetap netral: primary + foreground + muted.
- **Kenapa tidak jadi pelangi**: keenam hue disamakan lightness (±0.55
  light / ±0.77 dark) dan chroma dibatasi ≤ 0.13, jadi terbaca sebagai
  satu sistem. Tidak ada neon, tidak ada pastel, tidak ada gradient.
- **Penentuan warna**: turunan hash dari `subject.id` (`lib/subject-tone.ts`),
  bukan urutan array — supaya warna tidak berpindah saat daftar diurutkan
  atau difilter.

### Elevasi

- Bidang halaman datar. Hanya kartu yang bisa diaksi yang terangkat,
  lewat kelas `.surface` (dua lapis: shadow kontak tipis + sebar lembut).
- `.surface-hover` menambah elevasi saat hover. Alasan: menandai bahwa
  baris/kartu itu target aksi, bukan sekadar wadah.
- Tidak ada offset shadow keras. Tidak ada glow.

## Typography

- **Sans (body)**: Poppins, sesuai preset. Dimuat lewat `next/font` di
  `app/layout.tsx` sebagai `--font-sans`.
- **Mono (data)**: Roboto Mono (`--font-mono`). Dipakai untuk NIS, kode
  mapel, jam, dan field numerik. Selalu `tabular-nums` supaya kolom angka
  sejajar.
- **Ukuran body**: 14px. **Ukuran kecil** (label, caption): 11-12px.
  Huruf besar dengan tracking lebar hanya dipakai untuk header kolom
  tabel (`uppercase tracking-wide`), tidak untuk judul section.
- **Hierarki**: ditegakkan lewat size + weight, bukan lewat warna.
  Judul halaman `text-2xl font-semibold tracking-tight`.

## Motions

- Tidak ada animasi masuk/keluar, tidak ada scroll reveal, tidak ada
  parallax. Aplikasi ini bukan showcase.
- Yang ada: **transisi state** standar (hover, focus, toggle theme,
  open/close dialog). Cepat, ~150-200ms, tanpa easing dramatis.
- Motion dial: **MOTION 1** (hover only).

## Layout & rhythm

- Sections: **header halaman** (judul + statistik) lalu **konten
  utama** (table / form). Tidak ada hero, tidak ada CTA strip, tidak
  ada "trusted by" — aplikasi internal tidak butuh itu.
- Stat angka di header: dipisah jadi **stat card** mini (4 buah), bukan
  strip "/". Stat yang paling penting (Total Siswa) jadi focal dengan
  weight lebih kuat, sisanya balanced.
- Rhythm dial: **RHYTHM 1** (uniform). Section tidak butuh variasi
  komposisi karena audiens scan, bukan baca narasi.

## Energy

- Energy dial: **ENERGY 1** (calm). Setara vibe Linear / GOV.UK.
  Quiet, dense, cepat di-scan.

## Motif identitas (identity motif, R-20)

- **Mono untuk angka**: NIS, kode, tanggal, jam — semua numerik yang
  perlu di-scan pakai `font-mono tabular-nums`.
- **Dot untuk status**: status aktif/keluar ditampilkan sebagai dot 6px
  + label, bukan badge capsule. Memberi kesan "data observasi" bukan
  "tag marketing".
- **Empty state jujur**: ilustrasi minimal (satu icon konteks) +
  kalimat pendek + CTA spesifik. Tidak ada "Belum ada data, yuk
  tambahkan!" yang kosong.

## Keputusan antislop yang sudah di-pin (R-31)

- **Em dash `—`**: tidak dipakai di copy user-facing. Kalau butuh
  placeholder data (NIS kosong), pakai chip "Tanpa NIS".
- **Tombol pill**: tidak dipakai. Radius mengikuti `--radius: 0.45rem`
  (preset): kartu `rounded-xl`, tombol/input `rounded-lg`, elemen kecil
  `rounded-md`.
- **Offset shadow (neo-brutalist)**: tidak dipakai. Tidak ada bayangan
  keras 6px, tidak ada border tebal `border-2` berwarna foreground, tidak
  ada `hover:-translate`. Permukaan dibedakan lewat `ring-1
  ring-foreground/10`.
- **Glassmorphism**: 0. Tidak ada `backdrop-blur`.
- **Glow / shadow dramatis**: 0. Hanya shadow tipis untuk pop-up
  dialog.
- **Icon library**: lucide-react dengan stroke standar. Dipakai hanya
  untuk ikon yang punya relevansi literal (search, edit, hapus, reset,
  users). Tidak ada sparkle/AI orb/lightning.
- **No emoji** di UI kecuali user minta eksplisit.
- **Bahasa**: Indonesia. `<html lang="id">`. Copy naratif, label
  tombol, pesan toast, dan empty state semua dalam Bahasa Indonesia.
