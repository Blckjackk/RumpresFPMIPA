# Gemini.md — Prompt: Website Pengumuman Hasil Open Recruitment (Next.js + Animated Envelope)

## Instruksi untuk Gemini

Kamu adalah expert Next.js developer dan UI/UX engineer. Saya punya **proyek Next.js yang sudah berjalan** dan saya ingin menambahkan fitur baru: halaman pengumuman hasil Open Recruitment yang imersif dan tak terlupakan.

**Penting sebelum mulai:**
- Lihat dulu file-file yang sudah ada di proyek (globals.css, tailwind.config, komponen yang sudah ada) untuk memahami design system, color palette, dan font yang dipakai
- Jangan ubah atau override warna, font, atau style global yang sudah ada
- Ikuti pola dan konvensi kode yang sudah dipakai di proyek ini

---

## Konsep Utama

Peserta membuka website, memasukkan NIM mereka, lalu jika lolos mereka disambut dengan pengalaman membuka amplop digital — seolah menerima surat fisik penting. Ada **4 surat berurutan** yang masing-masing punya konten dan nuansa berbeda, diakhiri dengan confetti celebration.

---

## Stack Teknologi

Proyek sudah menggunakan **Next.js + Tailwind CSS**. Tambahan yang boleh diinstall:

```bash
npm install gsap           # untuk animasi utama
npm install canvas-confetti # untuk efek confetti di scene akhir
# @types/canvas-confetti jika pakai TypeScript
```

Gunakan `next/image` untuk semua tag `<img>`. Aset foto sudah ada:
- `public/foto_ketum.png`
- `public/foto_kadep.png`

---

## Struktur File yang Perlu Dibuat

```
app/
  pengumuman/
    page.tsx              ← Halaman 1: Input NIM
    [nim]/
      page.tsx            ← Halaman 2: Amplop + 4 Surat

components/
  pengumuman/
    NimInputForm.tsx      ← Form input NIM
    EnvelopeHero.tsx      ← Animasi amplop interaktif
    LetterViewer.tsx      ← Container + navigasi surat
    LetterCard.tsx        ← Kartu surat individual
    ProgressDots.tsx      ← Indikator surat 1/2/3/4
    CelebrationScreen.tsx ← Ending + confetti

lib/
  peserta.ts              ← Data & fungsi lookup peserta
  config.ts               ← Konfigurasi teks organisasi
```

---

## Spesifikasi Halaman 1 — `/pengumuman` (Input NIM)

### Tujuan
Peserta memasukkan NIM untuk mengecek apakah mereka lolos. Jika iya, redirect ke halaman surat.

### UI & Behavior
- Heading utama dan deskripsi singkat (sesuaikan dengan tone design yang sudah ada)
- Input field NIM: hanya angka, max 15 karakter, dengan label yang jelas
- Tombol "Cek Sekarang"
- **Jika NIM ditemukan & lolos:** `router.push('/pengumuman/${nim}')`
- **Jika tidak ditemukan:** tampilkan pesan *"NIM tidak ditemukan dalam daftar kelulusan"* — jangan kata "gagal" atau "ditolak"
- Loading state saat proses pengecekan (bisa simulasi delay 800ms untuk dramatisme)
- Validasi client-side: tidak boleh kosong, harus angka

### Animasi Halaman Input
- Input focus: border glow animation (gunakan warna accent yang sudah ada di proyek)
- Error state: shake animation `@keyframes shake`
- Tombol hover: transform + shadow yang konsisten dengan design system
- Saat loading: disable input + tombol, tampilkan spinner

---

## Spesifikasi Halaman 2 — `/pengumuman/[nim]` (Pengalaman Surat)

Halaman ini adalah inti dari fitur. Diakses setelah NIM valid ditemukan.

### Scene 0 — Intro Nama (1.5-2 detik)
```
Sequence GSAP:
1. Layar gelap
2. Teks "Ada pesan untukmu," muncul fade in (opacity: 0 → 1)
3. Nama peserta muncul scale dari 0.7 → 1 + opacity
4. Pause 1 detik
5. Elemen fade out, amplop muncul dari bawah
```

### Scene 1 — Amplop Tersegel
Amplop dibuat **murni dengan CSS** (bukan gambar/SVG), terdiri dari:
- `.envelope-body` — trapezoid bawah (background cream/paper color)
- `.envelope-flap` — segitiga atas yang bisa di-flip
- `.wax-seal` — lingkaran di tengah flap, animasi pulse glow

```
Animasi idle (GSAP, infinite):
gsap.to(envelopeRef.current, {
  y: -12,
  duration: 2,
  yoyo: true,
  repeat: -1,
  ease: "power1.inOut"
})

Animasi klik buka amplop:
1. .envelope-flap: rotateX dari 0 → -180deg (transform-origin: top center)
2. .letter-preview keluar dari dalam amplop: translateY dari 60px → -20px
3. Amplop scale + fade out
4. Letter card expand ke ukuran penuh
```

### Scene 2 — Surat 1: Kelulusan

```tsx
// Konten surat (semua teks dari config.ts, mudah diganti)
<LetterCard>
  <OrgLogo />                    {/* logo organisasi */}
  <p>Dengan bangga kami menyampaikan bahwa:</p>
  <h2 className="nama-peserta">{peserta.nama}</h2>  {/* shimmer effect */}
  <p className="nim">{peserta.nim}</p>
  <p>dinyatakan <strong>LOLOS</strong> dalam Open Recruitment</p>
  <p>{config.namaOrganisasi} {config.tahun}</p>
  <p>Selamat bergabung di keluarga besar kami!</p>
  <p>— Panitia Open Recruitment {config.tahun}</p>
</LetterCard>
```

Animasi:
- Kartu masuk dari bawah: `gsap.from(card, {y: 80, opacity: 0})`
- Setiap baris teks: `gsap.from('.line', {y: 20, opacity: 0, stagger: 0.15})`
- Nama peserta: CSS shimmer animation setelah muncul
- Tombol "Buka Surat Berikutnya →": muncul setelah delay 2.5 detik

### Scene 3 — Surat 2: Pesan Ketua Umum

```tsx
<LetterCard>
  <div className="letter-header">
    <Image
      src="/foto_ketum.png"   {/* FILE SUDAH ADA DI public/ */}
      alt="Foto Ketua Umum"
      width={80}
      height={80}
      className="rounded-full object-cover"
    />
    <div>
      <p className="font-bold">{config.ketum.nama}</p>
      <p className="text-sm">{config.ketum.jabatan}</p>
    </div>
  </div>
  <hr />
  <p>Saudara/i {peserta.nama},</p>
  {/* Paragraf pesan dari ketum — dari config.ts */}
  <p className="signature">Salam,<br/>{config.ketum.nama}</p>
</LetterCard>
```

Transisi masuk:
- Surat sebelumnya: `gsap.to(prevCard, {x: -100, opacity: 0, rotateY: -15, duration: 0.4})`
- Surat ini: `gsap.from(card, {x: 100, opacity: 0, duration: 0.5, delay: 0.2})`
- Foto: `gsap.from(photo, {scale: 0, rotation: -15, opacity: 0, duration: 0.6, ease: "back.out(1.7)"})`

### Scene 4 — Surat 3: Pesan Kepala Departemen

Struktur identik dengan Scene 3, ganti foto dan konten:

```tsx
<Image
  src="/foto_kadep.png"    {/* FILE SUDAH ADA DI public/ */}
  alt="Foto Kepala Departemen"
  width={80}
  height={80}
  className="rounded-full object-cover"
/>
```

Transisi: flip effect
```
gsap.to(prevCard, {rotateY: 90, duration: 0.3, onComplete: () => {
  // swap card
  gsap.from(newCard, {rotateY: -90, duration: 0.3})
}})
```

### Scene 5 — Surat 4: Info Lanjutan

```tsx
<LetterCard>
  <h3>📌 Langkah Selanjutnya</h3>
  {checklistItems.map((item, i) => (
    <div key={i} className="checklist-item" style={{animationDelay: `${i * 0.3}s`}}>
      <span className="check-icon">✓</span>
      <span>{item}</span>
    </div>
  ))}
  <p>Kami tidak sabar bertemu denganmu! 🎉</p>
  <Button onClick={goToCelebration}>Rayakan! 🎉</Button>
</LetterCard>
```

Animasi: setiap `.checklist-item` stagger masuk dari kiri, ikon `✓` bounce saat muncul.

### Scene 6 — Celebration

```tsx
// Gunakan canvas-confetti
import confetti from 'canvas-confetti';

useEffect(() => {
  confetti({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.3 },
    // gunakan warna dari color palette proyek
  });
}, []);
```

- Teks "SELAMAT BERGABUNG!" dengan CSS `@keyframes glow`
- Nama peserta + nama departemen
- Tombol "Mulai dari Awal" → reset state ke Scene 1

---

## Data Layer

```typescript
// lib/peserta.ts
export interface Peserta {
  nim: string;
  nama: string;
  departemen: string;
}

// GANTI dengan data peserta yang sesungguhnya
export const DAFTAR_PESERTA: Peserta[] = [
  { nim: "123456789", nama: "Nama Peserta", departemen: "Departemen Kominfo" },
  // ...tambah peserta lainnya
];

export function cariPeserta(nim: string): Peserta | undefined {
  return DAFTAR_PESERTA.find(p => p.nim === nim);
}
```

```typescript
// lib/config.ts
// SESUAIKAN semua nilai di bawah ini

export const ORGANISASI_CONFIG = {
  nama: "[Nama Organisasi]",         // TODO: GANTI
  tahun: "2025",                      // TODO: GANTI
  ketum: {
    nama: "[Nama Ketua Umum]",        // TODO: GANTI
    jabatan: "Ketua Umum",
    foto: "/foto_ketum.png",          // sudah ada di public/
    pesan: [
      "[Paragraf 1 pesan ketum]",     // TODO: GANTI
      "[Paragraf 2 pesan ketum]",     // TODO: GANTI
    ],
  },
  kadep: {
    nama: "[Nama Kepala Departemen]", // TODO: GANTI
    jabatan: "Kepala Departemen",
    foto: "/foto_kadep.png",          // sudah ada di public/
    pesan: [
      "[Paragraf 1 pesan kadep]",     // TODO: GANTI
      "[Paragraf 2 pesan kadep]",     // TODO: GANTI
    ],
  },
  infoLanjutan: {
    items: [
      "Simpan surat ini sebagai bukti kelulusan",
      "Bergabung ke grup resmi kami",
      "Hadir di acara Inaugurasi: [Tanggal]",  // TODO: GANTI
      "Dresscode: [Dresscode]",                 // TODO: GANTI
    ],
    linkGrup: "#",                    // TODO: GANTI
  },
};
```

---

## Hal Teknis Penting untuk Next.js

1. **`"use client"` wajib** di semua komponen yang pakai GSAP, useState, useEffect, atau event listener
2. **GSAP init di `useEffect`** bukan di top-level — hindari SSR mismatch:
   ```tsx
   useEffect(() => {
     const ctx = gsap.context(() => {
       // semua animasi di sini
     }, containerRef);
     return () => ctx.revert(); // cleanup
   }, []);
   ```
3. **`next/image` wajib** untuk `foto_ketum.png` dan `foto_kadep.png`
4. **`next/navigation`** untuk redirect: `import { useRouter } from 'next/navigation'`
5. **CSS Modules atau Tailwind** — ikuti yang sudah dipakai di proyek, jangan campur keduanya
6. Jika App Router, halaman detail `[nim]` bisa pakai `generateStaticParams` untuk pre-render semua NIM

---

## Apa yang Jangan Dilakukan

- ❌ Jangan hardcode warna hex baru — gunakan CSS variables / Tailwind classes yang sudah ada
- ❌ Jangan pakai `<img>` biasa — wajib `next/image`
- ❌ Jangan jalankan GSAP di luar `useEffect`
- ❌ Jangan ubah `tailwind.config.js`, `globals.css`, atau layout yang sudah ada
- ❌ Jangan buat placeholder foto dengan URL eksternal — foto sudah ada di `public/`