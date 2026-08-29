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

- **Primary (biru dongker)**: `oklch(0.42 0.13 265)` di light,
  `oklch(0.7 0.14 265)` di dark. Dipakai di primary button, focus ring,
  link aktif, dan satu aksen fokus per layar.
- **Foreground**: `oklch(0.18 0.02 260)` (light) /
  `oklch(0.96 0.01 260)` (dark). Untuk teks utama.
- **Muted**: `oklch(0.5 0.02 260)` untuk label sekunder dan metadata.
- **Netral**: putih, hitam, dan abu-abu netral untuk background dan
  border. **Bukan** bagian palette aktif (R-29).
- **Aksen destruktif**: `oklch(0.577 0.18 25)` hanya untuk tombol hapus
  dan state error.
- **Aksen status**: emerald (aktif) dan stone (keluar) — dipakai sebagai
  dot kecil, bukan sebagai blok warna. Bukan bagian palette utama.

Palette aktif maksimum: 2-3 core (primary + foreground + muted) + 1
accent (primary biru dongker). Sesuai R-29.

## Typography

- **Sans (body)**: DM Sans. Humanist sans, jelas di ukuran kecil, tidak
  berkarakter "techy". Cocok untuk aplikasi internal yang dipakai guru
  tiap hari.
- **Mono (data)**: IBM Plex Mono. Dipakai untuk NIS, kode mapel, dan
  field numerik. Karakter slab-nya membantu scanning angka dibanding
  Geist/JetBrains Mono yang terlalu "developer aesthetic" untuk konteks
  sekolah.
- **Ukuran body**: 14px. **Ukuran kecil** (label, caption): 11-12px.
  Huruf besar dengan tracking lebar hanya dipakai untuk header kolom
  tabel (`uppercase tracking-wide`).
- **Hierarki**: ditegakkan lewat size + weight, bukan lewat warna.

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
- **Tombol pill**: tidak dipakai. Radius tombol, input, dan card pakai
  `--radius: 0.5rem` (8px) atau `0.25rem` (4px) sesuai hierarki.
- **Glassmorphism**: 0. Tidak ada `backdrop-blur`.
- **Glow / shadow dramatis**: 0. Hanya shadow tipis untuk pop-up
  dialog.
- **Icon library**: lucide-react dengan stroke standar. Dipakai hanya
  untuk ikon yang punya relevansi literal (search, edit, hapus, reset,
  users). Tidak ada sparkle/AI orb/lightning.
- **No emoji** di UI kecuali user minta eksplisit.
- **Bahasa**: Indonesia. `<html lang="id">`. Copy naratif, label
  tombol, pesan toast, dan empty state semua dalam Bahasa Indonesia.
