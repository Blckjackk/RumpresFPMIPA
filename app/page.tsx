"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ======================================================
   TYPES
   ====================================================== */
interface ApplicantData {
  nim: string;
  nama: string;
  departemen: string;
  jabatan: string;
}

interface MessageData {
  nim: string;
  staffNim: string;
  staffName: string;
  message: string;
  response: string;
  timestamp: string;
}

interface DepartmentData {
  id: string;
  name: string;
  fullName: string;
  kadepName: string;
  kadepPhoto: string;
  color: string;
  message: string;
}

/* ======================================================
   PAGE
   ====================================================== */
export default function Home() {
  const [nim, setNim] = useState("");
  const [applicant, setApplicant] = useState<ApplicantData | null>(null);
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [deptInfo, setDeptInfo] = useState<DepartmentData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [applicantsList, setApplicantsList] = useState<ApplicantData[]>([]);
  const [messagesList, setMessagesList] = useState<MessageData[]>([]);
  const [departmentsList, setDepartmentsList] = useState<DepartmentData[]>([]);
  const [dataReady, setDataReady] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  /* ---- Load data ---- */
  useEffect(() => {
    async function load() {
      try {
        const [applicantsRes, messagesRes, deptsRes] = await Promise.all([
          fetch("/api/applicants", { cache: "no-store" }),
          fetch("/api/messages", { cache: "no-store" }),
          fetch("/api/departments", { cache: "no-store" }),
        ]);
        const applicants: ApplicantData[] = await applicantsRes.json();
        const messages: MessageData[] = await messagesRes.json();
        const depts: DepartmentData[] = await deptsRes.json();
        setApplicantsList(applicants);
        setMessagesList(messages);
        setDepartmentsList(depts);
        setDataReady(true);
      } catch (err) {
        console.error("Error loading data:", err);
        setDataReady(true);
      }
    }
    load();
  }, []);

  /* ---- GSAP: Login animations ---- */
  useEffect(() => {
    if (!containerRef.current || applicant) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".nav-bar", { y: -40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.1,
      });
      gsap.fromTo(".hero-el", { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "power2.out", delay: 0.25,
      });
      // Floating cloud shapes
      gsap.to(".cloud-a", { y: -10, x: 5, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".cloud-b", { y: 8, x: -6, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: -2 });
      gsap.to(".cloud-c", { y: -6, x: 4, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1, delay: -3 });
    }, containerRef);
    return () => ctx.revert();
  }, [applicant, dataReady]);

  /* ---- GSAP: Result animations ---- */
  useEffect(() => {
    if (!resultRef.current || !applicant) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".res-head", { y: 25, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.1,
      });
      gsap.fromTo(".res-card", { y: 35, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out", delay: 0.25,
      });
      gsap.fromTo(".res-action", { y: 15, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.7,
      });
    }, resultRef);
    return () => ctx.revert();
  }, [applicant]);

  /* ---- NIM submit ---- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nim.trim();
    if (!trimmed) {
      setError("NIM tidak boleh kosong");
      inputRef.current?.classList.remove("shake");
      void inputRef.current?.offsetWidth;
      inputRef.current?.classList.add("shake");
      return;
    }
    setIsLoading(true);
    setApplicant(null);
    setNotFound(false);
    setError("");

    setTimeout(() => {
      const found = applicantsList.find(
        (a) => a.nim === trimmed || a.nim.toLowerCase() === trimmed.toLowerCase()
      );
      if (!found) { setNotFound(true); setIsLoading(false); return; }
      const foundMsg = messagesList.find((m) => m.staffNim === found.nim && m.message.trim() !== "");
      const foundDept = departmentsList.find((d) => d.name.toLowerCase() === found.departemen.toLowerCase());
      setApplicant(found);
      setPersonalMessage(foundMsg?.message ?? "");
      setDeptInfo(foundDept ?? null);
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setApplicant(null); setDeptInfo(null); setPersonalMessage("");
    setNim(""); setNotFound(false); setError("");
  };

  /* ======================================================
     RENDER
     ====================================================== */
  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col bg-rp-hero overflow-x-hidden">

      {/* ── Decorative clouds ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="cloud-a absolute -top-20 -left-20 w-[350px] h-[350px] rounded-full bg-white/40 blur-[80px]" />
        <div className="cloud-b absolute top-[30%] -right-10 w-[300px] h-[300px] rounded-full bg-[#A8D8F0]/30 blur-[90px]" />
        <div className="cloud-c absolute -bottom-10 left-[30%] w-[400px] h-[400px] rounded-full bg-[#C4E2F5]/25 blur-[100px]" />
        {/* Subtle brand glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#5CB3E8]/10 blur-[120px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="nav-bar sticky top-0 z-50 w-full nav-glass">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B5E9E] to-[#3A8FD6] text-lg shadow-md shadow-blue-400/15 shrink-0">
              🏆
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-bold text-[#0D2B4E] tracking-[-0.01em]">
                Rumah Prestasi
              </span>
              <span className="text-[10px] text-[#4A7BA5] tracking-wide">
                FPMIPA UPI · Open Recruitment 2026
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex badge-rp">
              #FPMIPAJUARA
            </span>
            {applicant && (
              <button onClick={handleLogout} className="btn-light text-xs px-3.5 py-1.5 rounded-lg">
                Keluar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-16 w-full max-w-5xl mx-auto">

        {!applicant ? (
          /* ========== LOGIN VIEW ========== */
          <div className="w-full max-w-[400px]">
            {/* Hero text */}
            <div className="text-center mb-8">
              <div className="hero-el badge-gold mb-5 mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A828]" />
                Pengumuman Resmi
              </div>

              <h1 className="hero-el text-[1.85rem] sm:text-[2.25rem] font-extrabold text-[#0D2B4E] leading-[1.15] mb-3">
                Cek Hasil Seleksi{" "}
                <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B5E9E] to-[#5CB3E8]">
                  Open Recruitment
                </span>
              </h1>

              <p className="hero-el text-[14px] text-[#4A7BA5] max-w-xs mx-auto leading-relaxed">
                Masukkan NIM kamu untuk melihat pengumuman hasil seleksi Rumah Prestasi 2026
              </p>
            </div>

            {/* Card */}
            <div className="hero-el card-white accent-line-blue overflow-hidden p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="nim-input" className="block text-[11px] font-semibold text-[#4A7BA5] tracking-wide uppercase mb-2">
                    Nomor Induk Mahasiswa
                  </label>
                  <input
                    ref={inputRef}
                    id="nim-input"
                    type="text"
                    autoComplete="off"
                    placeholder="cth: 2401001"
                    value={nim}
                    maxLength={10}
                    onChange={(e) => { setNim(e.target.value); setError(""); setNotFound(false); }}
                    className={`w-full rounded-xl px-4 py-3 bg-[#EDF6FC] border ${
                      error || notFound ? "border-red-400 focus:border-red-500" : "border-[#C2DFF0] focus:border-[#3A8FD6]"
                    } text-[#0D2B4E] font-medium text-center tracking-[0.15em] placeholder:text-[#A8C8E0] placeholder:tracking-normal placeholder:text-sm outline-none transition-all duration-200 focus-ring`}
                  />
                  {error && (
                    <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
                  )}
                  {notFound && (
                    <p className="text-xs text-red-500 mt-2 text-center leading-relaxed">
                      NIM tidak terdaftar. <span className="text-[#4A7BA5]">Pastikan NIM sudah benar.</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !dataReady}
                  className="btn-rp w-full py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spin inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />
                      Memvalidasi...
                    </span>
                  ) : (
                    "Cek Hasil Seleksi"
                  )}
                </button>
              </form>
            </div>

            <p className="hero-el text-[11px] text-[#8AACCC] text-center mt-5">
              Data bersifat rahasia dan hanya dapat diakses pemilik NIM
            </p>
          </div>

        ) : (
          /* ========== RESULT VIEW ========== */
          <div ref={resultRef} className="w-full space-y-8">

            {/* Header */}
            <div className="res-head text-center space-y-3">
              <div className="badge-success mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Lulus Seleksi
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D2B4E]">
                Selamat, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B5E9E] to-[#3A8FD6]">{applicant.nama}</span>!
              </h1>
              <p className="text-sm text-[#4A7BA5]">
                NIM: {applicant.nim}
                <span className="mx-1.5 text-[#C2DFF0]">·</span>
                <span className="text-emerald-600 font-medium">Diterima sebagai Staf Muda</span>
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT COL */}
              <div className="lg:col-span-7 space-y-6">

                {/* Info card */}
                <div className="res-card card-white accent-line-green overflow-hidden p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg text-emerald-600 shrink-0">
                      ✓
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-[#4A7BA5] tracking-widest uppercase block">Status</span>
                      <h2 className="text-base font-bold text-[#0D2B4E]">Diterima Sebagai Staf Muda</h2>
                    </div>
                  </div>

                  <div className="space-y-0 divide-y divide-[#EDF6FC]">
                    {[
                      { label: "Nama Lengkap", value: applicant.nama, bold: true },
                      { label: "NIM", value: applicant.nim },
                      { label: "Departemen", value: deptInfo?.fullName ?? applicant.departemen, highlight: true },
                      { label: "Jabatan", value: applicant.jabatan, gold: true },
                      { label: "Pelantikan", value: "Segera diinfokan via grup", muted: true },
                    ].map((row, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center py-3">
                        <span className="text-[10px] font-semibold tracking-widest text-[#8AACCC] sm:w-1/3 mb-0.5 sm:mb-0 uppercase">
                          {row.label}
                        </span>
                        <span className={`text-sm sm:w-2/3 ${
                          row.bold ? "font-bold text-[#0D2B4E] text-[15px]" :
                          row.highlight ? "font-semibold text-[#1B5E9E]" :
                          row.gold ? "font-semibold text-[#B8931F]" :
                          row.muted ? "text-[#8AACCC] text-[13px]" :
                          "text-[#2D4A6A]"
                        }`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dept welcome */}
                {deptInfo && (
                  <div className="res-card card-white overflow-hidden p-6" style={{ borderColor: `${deptInfo.color}30` }}>
                    <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl" style={{ background: `linear-gradient(90deg, ${deptInfo.color}, ${deptInfo.color}88)` }} />

                    <h3 className="text-[10px] font-semibold tracking-[0.12em] text-[#8AACCC] uppercase mb-5 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: deptInfo.color }} />
                      Sambutan Ketua Departemen
                    </h3>

                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <img
                        src={deptInfo.kadepPhoto}
                        alt={deptInfo.kadepName}
                        className="w-14 h-14 rounded-xl border-2 border-[#EDF6FC] bg-[#EDF6FC] shrink-0 shadow-sm"
                      />
                      <div className="space-y-2.5 flex-1">
                        <div>
                          <h4 className="text-[15px] font-bold text-[#0D2B4E]">{deptInfo.kadepName}</h4>
                          <span className="text-[11px] text-[#4A7BA5]">Ketua {deptInfo.fullName}</span>
                        </div>
                        <div className="relative bg-[#EDF6FC] rounded-xl p-4">
                          <span className="absolute -top-2 left-3 text-3xl text-[#C2DFF0] font-serif leading-none">&ldquo;</span>
                          <p className="text-[13px] leading-relaxed text-[#2D4A6A] italic pl-1">
                            {deptInfo.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COL */}
              <div className="lg:col-span-5 space-y-6">

                {/* Azzam message */}
                <div className="res-card card-white accent-line-gold overflow-hidden p-6">
                  <h3 className="text-[10px] font-semibold tracking-[0.12em] text-[#B8931F] uppercase mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A828]" />
                    Pesan Ketua Umum
                  </h3>

                  <div className="flex items-center gap-3 mb-5">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Azzam"
                      alt="Ahmad Izzuddin Azzam"
                      className="w-12 h-12 rounded-xl border-2 border-[#EDF6FC] bg-[#EDF6FC] shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#0D2B4E]">Ahmad Izzuddin Azzam</h4>
                      <span className="text-[10px] text-[#B8931F] font-medium">Ketua Umum · BEM TumbuhAsa</span>
                    </div>
                  </div>

                  {personalMessage ? (
                    <div className="bg-[#FFFBEB] rounded-xl p-4 border border-[#F5E6A3]/40">
                      <p className="text-[13px] leading-relaxed text-[#5D4A0F] whitespace-pre-line italic">
                        &ldquo;{personalMessage}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#EDF6FC] rounded-xl p-4">
                      <p className="text-[13px] leading-relaxed text-[#4A7BA5] italic">
                        &ldquo;Selamat bergabung di keluarga besar Rumah Prestasi! Ini adalah langkah awal perjuangan barumu. Jadikan setiap tantangan sebagai tempat berproses terbaikmu. Aku menunggumu di pelantikan nanti!&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Surat */}
                <div className="res-card relative rounded-2xl bg-white p-6 shadow-lg shadow-blue-900/[0.04] overflow-hidden border border-[#C2DFF0]">
                  {/* Notebook lines */}
                  <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(rgba(194,223,240,0.4)_1px,transparent_1px)] bg-[size:100%_1.75rem]" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B5E9E] via-[#3A8FD6] to-[#D4A828]" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start gap-4 border-b border-[#EDF6FC] pb-3.5">
                      <div>
                        <h4 className="text-sm font-extrabold text-[#1B5E9E] tracking-wide">SURAT UNTUK KELUARGA BARU</h4>
                        <span className="text-[10px] text-[#8AACCC] font-semibold uppercase tracking-wider">BEM FPMIPA UPI 2026</span>
                      </div>
                      <span className="text-[10px] font-medium text-[#8AACCC] whitespace-nowrap">Mei 2026</span>
                    </div>

                    <div className="text-[12px] leading-[1.8] text-[#2D4A6A] space-y-2.5 text-justify">
                      <p>Assalamu&rsquo;alaikum Warahmatullahi Wabarakatuh, salam hangat, dan salam prestasi! 🌟</p>
                      <p>Dengan penuh rasa bahagia dan bangga, kami menyambut kehadiranmu. Kamu yang sedang membaca surat ini adalah orang yang luar biasa — terpilih dari sekian banyak pendaftar karena semangat dan potensi besarmu.</p>
                      <p>Rumah Prestasi hadir bukan sekadar wadah berorganisasi, melainkan tempat bertumbuh, merajut mimpi, dan berkolaborasi menciptakan dampak nyata bagi seluruh mahasiswa FPMIPA.</p>
                      <p>Selamat berproses, tuangkan karya terbaikmu, dan mari tunjukkan bersama bahwa <strong className="text-[#1B5E9E]">#FPMIPAJUARA</strong>!</p>
                    </div>

                    <div className="pt-3.5 border-t border-[#EDF6FC] flex flex-col items-end">
                      <span className="text-[10px] italic text-[#8AACCC]">Tertanda hangat,</span>
                      <span className="font-dancing text-2xl text-[#1B5E9E] mt-1 mb-0.5">Azzam</span>
                      <span className="text-[9px] font-bold text-[#8AACCC] tracking-wider uppercase">Ahmad Izzuddin Azzam</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="res-action flex justify-center pt-2">
              <button onClick={handleLogout} className="btn-light inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13px]">
                ← Kembali ke Halaman Utama
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full py-8 px-5 border-t border-[#C2DFF0]/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex justify-center gap-3">
            {[
              { handle: "@rumahprestasi.fpmipa", href: "https://www.instagram.com/rumahprestasi.fpmipa" },
              { handle: "@fpmipaupiofficial", href: "https://www.instagram.com/fpmipaupiofficial" },
            ].map(({ handle, href }) => (
              <a
                key={handle}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-light flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px]"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                {handle}
              </a>
            ))}
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-[11px] text-[#4A7BA5]">© 2026 Rumah Prestasi FPMIPA UPI — Kabinet TumbuhAsa</p>
            <p className="text-[10px] text-[#8AACCC]">Universitas Pendidikan Indonesia · Bandung</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
