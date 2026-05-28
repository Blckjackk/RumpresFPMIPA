ENHANCE.md — Prompt: Maksimalkan Visual Design Website OR Announcement
🎯 Tujuan
Website pengumuman hasil Open Recruitment ini sudah berjalan secara fungsional. Sekarang tugasmu adalah memaksimalkan tampilannya secara visual — buat setiap halaman terasa hidup, premium, dan berkesan. Jangan ubah logika, routing, atau struktur data apapun. Fokus murni pada estetika dan motion.
Lihat seluruh kode yang ada dulu sebelum mulai. Pahami design system, color palette, dan font yang sudah dipakai — semua enhancement harus konsisten dan memperkuat identitas visual yang sudah ada, bukan melawannya.

🔍 Cara Membaca Proyek Sebelum Mulai
Sebelum menulis satu baris kode pun, buka dan baca file-file berikut:

tailwind.config.js atau tailwind.config.ts — lihat custom colors, fonts, dan spacing
globals.css atau app/globals.css — lihat CSS variables dan base styles
Semua komponen di components/pengumuman/ — pahami struktur yang sudah ada
app/pengumuman/page.tsx dan app/pengumuman/[nim]/page.tsx — pahami flow halaman

Jangan asumsi warnanya, jangan override variabel yang sudah ada.

📦 Dependencies Baru yang Boleh Diinstall
bashnpm install @tsparticles/react @tsparticles/slim   # particle background
npm install gsap                                    # jika belum ada
npm install canvas-confetti                         # jika belum ada
Jika proyek sudah punya Framer Motion, boleh pakai itu sebagai pengganti GSAP untuk komponen tertentu — jangan install keduanya jika salah satu sudah ada.

🌌 1. Background Layer — Buat Layar Terasa Hidup
A. Particle Background (Halaman Amplop)
Tambahkan partikel melayang halus di background halaman amplop (/pengumuman/[nim]). Partikel harus:

Sangat subtle — opacity rendah (0.15–0.3), jangan distraktif
Warna diambil dari color palette yang sudah ada di proyek
Ukuran kecil (1–3px), bergerak lambat dan organik
Berjumlah sekitar 60–80 partikel
Interaktif: sedikit menghindari kursor (repulse effect, jarak ~80px)

tsx// Contoh konfigurasi tsParticles — sesuaikan warna dengan proyek
const particlesOptions = {
  particles: {
    number: { value: 70 },
    color: { value: ["#WARNA_DARI_PROYEK"] }, // ambil dari CSS variables
    opacity: { value: 0.2, random: true },
    size: { value: 2, random: true },
    move: {
      enable: true,
      speed: 0.6,
      direction: "none",
      random: true,
      out_mode: "out",
    },
    links: {
      enable: true,
      distance: 100,
      opacity: 0.08,
    },
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "repulse" },
    },
    modes: {
      repulse: { distance: 80, duration: 0.4 },
    },
  },
};
Letakkan komponen <ParticleBackground /> sebagai layer paling bawah dengan position: fixed, z-index: 0, tidak menghalangi interaksi (pointer-events: none).
B. Noise / Grain Texture Overlay
Tambahkan CSS grain overlay di semua halaman untuk kesan depth dan tekstur kertas:
css/* Tambahkan ke globals.css atau sebagai komponen */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  animation: grain 0.5s steps(1) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  20%       { transform: translate(-2%, -3%); }
  40%       { transform: translate(3%, 1%); }
  60%       { transform: translate(-1%, 4%); }
  80%       { transform: translate(4%, -2%); }
}
C. Radial Gradient Vignette
Di halaman amplop, tambahkan vignette halus di sudut-sudut layar:
css.vignette {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
}
D. Floating Orbs / Glow Spots (Opsional, untuk kesan dramatis)
Tambahkan 2–3 blur circle besar yang bergerak sangat lambat di background:
css.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
  /* warna dari palette proyek */
}

/* Animasi drift pelan */
@keyframes orb-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(30px, -20px) scale(1.05); }
  66%       { transform: translate(-20px, 15px) scale(0.95); }
}

💎 2. Kartu Surat — Depth & Materialitas
A. Efek Kertas Menumpuk (Stacked Paper)
Surat seharusnya terlihat seperti tumpukan kertas fisik. Tambahkan pseudo-elements:
css.letter-card {
  position: relative;
}

/* Layer kertas di belakang */
.letter-card::before,
.letter-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: -1;
}

.letter-card::before {
  transform: rotate(-1.5deg) translate(-4px, 4px);
  background: /* warna sedikit lebih gelap dari kartu */;
  opacity: 0.5;
}

.letter-card::after {
  transform: rotate(1deg) translate(4px, 6px);
  background: /* warna sedikit lebih gelap lagi */;
  opacity: 0.3;
}
B. Shadow Berlapis (Layered Box Shadow)
Ganti shadow kartu yang ada dengan shadow berlapis untuk kesan elevasi nyata:
css.letter-card {
  box-shadow:
    0 1px 1px rgba(0,0,0,0.08),
    0 2px 2px rgba(0,0,0,0.08),
    0 4px 4px rgba(0,0,0,0.08),
    0 8px 8px rgba(0,0,0,0.08),
    0 16px 32px rgba(0,0,0,0.12),
    0 32px 64px rgba(0,0,0,0.08);
}
C. Hover Tilt Effect (Kartu)
Saat mouse hover di atas kartu surat, kartu sedikit tilt mengikuti posisi kursor (parallax effect):
tsxconst handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  
  gsap.to(cardRef.current, {
    rotateY: x * 8,   // max 8 derajat
    rotateX: -y * 8,
    duration: 0.3,
    ease: "power2.out",
    transformPerspective: 800,
  });
};

const handleMouseLeave = () => {
  gsap.to(cardRef.current, {
    rotateY: 0,
    rotateX: 0,
    duration: 0.5,
    ease: "elastic.out(1, 0.5)",
  });
};
D. Watermark / Background Pattern pada Kartu
Di dalam kartu surat, tambahkan pattern atau watermark sangat subtle:
css.letter-card-inner {
  background-image: 
    /* Subtle dot grid pattern */
    radial-gradient(circle, currentColor 1px, transparent 1px);
  background-size: 24px 24px;
  background-color: /* warna dasar kartu */;
  /* Opacity pattern sangat rendah: */
  /* Gunakan mask atau opacity layer di atas pattern */
}
Atau gunakan SVG inline watermark logo organisasi:
tsx<div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
  <span className="text-[180px] font-bold opacity-[0.03] select-none">
    {/* Inisial atau logo organisasi */}
  </span>
</div>

✨ 3. Amplop — Lebih Dramatis & Detail
A. Wax Seal yang Lebih Hidup
Wax seal harus terasa premium. Tambahkan:

Inner gradient untuk efek 3D (highlight di pojok kiri atas)
Animasi pulse glow yang lebih kompleks
Texture/pattern di dalam seal (bisa inisial organisasi)

css.wax-seal {
  position: relative;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    /* warna lebih terang */ 0%,
    /* warna utama */ 50%,
    /* warna lebih gelap */ 100%
  );
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.3),
    inset 0 -2px 4px rgba(0,0,0,0.2),
    0 0 0 2px /* warna border */,
    0 0 20px /* warna glow */,
    0 0 40px /* warna glow lebih transparan */;
  animation: seal-pulse 2s ease-in-out infinite;
}

@keyframes seal-pulse {
  0%, 100% { box-shadow: 0 0 20px /* glow */, ...; }
  50%       { box-shadow: 0 0 35px /* glow lebih kuat */, ...; }
}
B. Envelope Texture
Amplop bisa diberi texture subtle menggunakan CSS:
css.envelope-body {
  background-image:
    /* Diamond/linen pattern untuk kesan kertas envelope */ 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(0,0,0,0.015) 10px,
      rgba(0,0,0,0.015) 11px
    );
}
C. Shadow Dinamis saat Hover
Saat hover amplop, shadow bergerak seolah sumber cahaya berubah:
tsxconst handleEnvelopeHover = (e: React.MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
  const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
  
  gsap.to(envelopeRef.current, {
    boxShadow: `${-x}px ${-y}px 40px rgba(0,0,0,0.3)`,
    duration: 0.2,
  });
};

🎞️ 4. Transisi & Motion — Halus dan Berkesan
A. Page Transition (Antar Halaman)
Tambahkan transisi saat pindah dari halaman NIM ke halaman surat:
tsx// Buat komponen PageTransition wrapper
// Gunakan Framer Motion atau GSAP untuk:
// - Halaman lama: fade out + slight scale down (0.98)
// - Halaman baru: fade in + slide up dari bawah (y: 20 → 0)
// Duration total: ~600ms
B. Reveal Animation saat Scroll (Kartu Info)
Jika ada konten di bawah yang perlu di-scroll, gunakan Intersection Observer:
tsxconst useRevealOnScroll = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.from(ref.current, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
};
C. Magnetic Button Effect
Tombol-tombol utama (Cek Sekarang, Buka Surat Berikutnya, Rayakan) punya efek magnet saat kursor mendekat:
tsxconst handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  
  gsap.to(btn, {
    x: x * 0.3,
    y: y * 0.3,
    duration: 0.3,
    ease: "power2.out",
  });
};

const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  gsap.to(e.currentTarget, {
    x: 0, y: 0,
    duration: 0.5,
    ease: "elastic.out(1, 0.4)",
  });
};
D. Shimmer Loading / Skeleton
Saat loading di halaman input NIM, gunakan shimmer skeleton yang konsisten dengan design system:
css@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    /* warna base */ 25%,
    /* warna sedikit lebih terang */ 50%,
    /* warna base */ 75%
  );
  background-size: 200% auto;
  animation: shimmer 1.5s linear infinite;
}
E. Cursor Custom (Desktop Only)
Ganti cursor default dengan cursor dot yang mengikuti gerakan mouse dengan easing:
tsx// components/CustomCursor.tsx
// Terdiri dari 2 elemen:
// 1. Dot kecil (8px) yang mengikuti kursor presisi (tidak ada delay)
// 2. Ring besar (40px) yang mengikuti dengan delay (lerp/ease)

// Dot: posisi langsung dari mousemove event
// Ring: posisi di-lerp menuju posisi dot setiap frame dengan requestAnimationFrame

// Behavior khusus:
// - Hover di atas tombol: ring scale up (2x) + fill
// - Hover di atas amplop: ring berubah jadi ikon "click" / pointer
// - Saat animasi berlangsung: cursor bisa di-hide

// Hanya tampil di desktop (hidden di touch device)

🌟 5. Tipografi — Detail yang Membuat Beda
A. Text Gradient untuk Elemen Penting
Nama peserta dan teks "SELAMAT" di celebration screen pakai gradient text:
css.gradient-text {
  background: linear-gradient(
    135deg,
    /* warna 1 dari palette */,
    /* warna 2 dari palette */,
    /* warna 1 lagi untuk loop */
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: text-shimmer 3s linear infinite;
}

@keyframes text-shimmer {
  0%   { background-position: 0% center; }
  100% { background-position: 200% center; }
}
B. Animated Underline untuk Heading
Heading di dalam surat bisa punya animated underline saat pertama kali muncul:
css.animated-underline {
  position: relative;
  display: inline-block;
}

.animated-underline::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: /* warna accent */;
  transition: width 0.8s ease;
}

.animated-underline.visible::after {
  width: 100%;
}
C. Staggered Letter Animation (Nama Peserta)
Nama peserta di surat pertama muncul huruf per huruf:
tsxconst AnimatedName = ({ name }: { name: string }) => {
  return (
    <span aria-label={name}>
      {name.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block opacity-0"
          ref={(el) => { /* collect refs */ }}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

// GSAP trigger setelah surat muncul:
gsap.to(letterRefs, {
  opacity: 1,
  y: 0,
  stagger: 0.04,
  duration: 0.4,
  ease: "back.out(2)",
});

🎊 6. Celebration Screen — Lebih Spektakuler
Upgrade confetti dan ending screen menjadi lebih dramatis:
tsx// Multi-burst confetti dengan timing berbeda
const triggerCelebration = () => {
  // Burst 1: dari kiri
  confetti({ angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, particleCount: 80 });
  
  // Burst 2: dari kanan (delay 200ms)
  setTimeout(() => {
    confetti({ angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, particleCount: 80 });
  }, 200);
  
  // Burst 3: dari atas tengah (delay 400ms)
  setTimeout(() => {
    confetti({ 
      spread: 100, 
      origin: { x: 0.5, y: 0.2 }, 
      particleCount: 120,
      startVelocity: 30,
    });
  }, 400);
};
Tambahkan juga efek sparkle stars yang muncul random di sekitar teks "SELAMAT":
tsx// Generate 20-30 sparkle elements dengan posisi random
// Setiap sparkle: CSS star shape atau ✦ character
// Animasi: scale 0→1→0 + fade, stagger random, repeat beberapa kali

📱 7. Responsive Polish

Pastikan particle background dinonaktifkan atau dikurangi drastis di mobile (max 30 partikel, speed lebih lambat) untuk performa
Custom cursor dinonaktifkan di touch device (@media (pointer: coarse))
Tilt effect kartu dinonaktifkan di touch device
Confetti tetap jalan di mobile
Grain overlay tetap ada di mobile tapi opacity sedikit dikurangi


⚡ 8. Performa — Jangan Sampai Berat

Semua GSAP animation pakai will-change: transform hanya saat animasi aktif, lalu hapus setelahnya
Particle background pakai requestAnimationFrame atau tsParticles yang sudah dioptimasi
Grain animation: pertimbangkan prefers-reduced-motion media query
Lazy load komponen berat (dynamic(() => import(...), { ssr: false })) untuk particle dan confetti
Cleanup semua GSAP contexts di useEffect return function

tsx// Contoh lazy load untuk particle
const ParticleBackground = dynamic(
  () => import('@/components/pengumuman/ParticleBackground'),
  { ssr: false }
);

// Contoh reduced motion check
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion) {
  // jalankan animasi berat
}

✅ Checklist Output yang Diharapkan

 Particle background di halaman amplop (subtle, tidak distraktif)
 Grain texture overlay di semua halaman
 Vignette effect di halaman amplop
 Stacked paper effect pada kartu surat
 Layered box shadow pada kartu surat
 Hover tilt effect pada kartu
 Wax seal dengan gradient 3D + pulse glow
 Magnetic button effect pada tombol utama
 Custom cursor (desktop only)
 Gradient + shimmer text untuk nama peserta
 Staggered letter animation untuk nama peserta
 Animated underline pada heading
 Multi-burst confetti di celebration screen
 Sparkle stars di celebration screen
 Semua animasi baru pakai prefers-reduced-motion check
 Tidak ada regresi performa (Lighthouse score tidak turun drastis)
 Design system / color palette proyek tetap konsisten, tidak ada warna baru di-hardcode
ENDOFFILE