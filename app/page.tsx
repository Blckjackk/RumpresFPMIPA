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

  /* ---- Fetch all necessary data on mount ---- */
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

  /* ---- GSAP: Login view animations ---- */
  useEffect(() => {
    if (!containerRef.current || applicant) return;

    const ctx = gsap.context(() => {
      // Navbar entrance
      gsap.fromTo(
        ".navbar",
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );

      // Hero elements stagger
      gsap.fromTo(
        ".hero-stagger",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.3,
        }
      );

      // Background orbs float
      gsap.to(".orb-1", {
        y: -18,
        x: 10,
        duration: 4,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(".orb-2", {
        y: 14,
        x: -8,
        duration: 5,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        delay: -2,
      });
      gsap.to(".orb-3", {
        y: -12,
        x: -6,
        duration: 6,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        delay: -4,
      });

      // Footer entrance
      gsap.fromTo(
        ".footer-section",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".footer-section",
            start: "top 95%",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [applicant, dataReady]);

  /* ---- GSAP: Result view animations ---- */
  useEffect(() => {
    if (!resultRef.current || !applicant) return;

    const ctx = gsap.context(() => {
      // Result header
      gsap.fromTo(
        ".result-header",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 }
      );

      // Result cards stagger
      gsap.fromTo(
        ".result-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.3,
        }
      );

      // Action buttons
      gsap.fromTo(
        ".result-action",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.9 }
      );
    }, resultRef);

    return () => ctx.revert();
  }, [applicant]);

  /* ---- NIM submit handler ---- */
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
      const foundApplicant = applicantsList.find(
        (a) =>
          a.nim === trimmed || a.nim.toLowerCase() === trimmed.toLowerCase()
      );

      if (!foundApplicant) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const foundMsg = messagesList.find(
        (m) => m.staffNim === foundApplicant.nim && m.message.trim() !== ""
      );

      const foundDept = departmentsList.find(
        (d) => d.name.toLowerCase() === foundApplicant.departemen.toLowerCase()
      );

      setApplicant(foundApplicant);
      setPersonalMessage(foundMsg?.message ?? "");
      setDeptInfo(foundDept ?? null);
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setApplicant(null);
    setDeptInfo(null);
    setPersonalMessage("");
    setNim("");
    setNotFound(false);
    setError("");
  };

  /* ======================================================
     RENDER
     ====================================================== */
  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#0a0f1e] text-slate-100 selection:bg-blue-500/30 selection:text-white"
    >
      {/* ── Background Layer ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="orb-1 absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#1E3A8A] opacity-25 blur-[140px]" />
        <div className="orb-2 absolute top-1/3 -right-20 w-[380px] h-[380px] rounded-full bg-[#6366F1] opacity-[0.08] blur-[130px]" />
        <div className="orb-3 absolute -bottom-20 left-1/4 w-[480px] h-[480px] rounded-full bg-[#3B82F6] opacity-[0.12] blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#C9A227] opacity-[0.04] blur-[120px]" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-pattern" />
      </div>

      {/* ── Navbar ── */}
      <header className="navbar sticky top-0 z-50 w-full glass-navbar">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] shadow-lg shadow-blue-500/20 text-lg shrink-0">
              🏆
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-bold tracking-wide text-white/90">
                Rumah Prestasi
              </span>
              <span className="text-[10px] text-slate-400 tracking-wide">
                FPMIPA UPI · Open Recruitment 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center text-[10px] font-semibold tracking-widest px-3 py-1.5 rounded-full text-blue-300/80 bg-blue-500/8 border border-blue-400/10 uppercase">
              #FPMIPAJUARA
            </span>
            {applicant && (
              <button
                onClick={handleLogout}
                className="btn-ghost text-xs font-medium px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white"
              >
                Keluar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-16 w-full max-w-6xl mx-auto">
        {!applicant ? (
          /* ==================================================
             LOGIN VIEW
             ================================================== */
          <div className="w-full max-w-[420px]">
            <div className="text-center mb-10">
              {/* Badge */}
              <div className="hero-stagger inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] text-[#C9A227] bg-[#C9A227]/8 border border-[#C9A227]/20 uppercase mb-6 badge-shimmer">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
                Pengumuman Resmi
              </div>

              {/* Heading */}
              <h1 className="hero-stagger text-[2rem] sm:text-[2.5rem] font-extrabold tracking-tight text-white leading-[1.1] mb-4">
                Selamat Datang,{" "}
                <br className="hidden sm:block" />
                <span className="text-gradient-hero">Sobat Prestasi</span>
              </h1>

              {/* Subtitle */}
              <p className="hero-stagger text-[15px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                Masukkan NIM untuk melihat hasil seleksi Open Recruitment Rumah Prestasi 2026
              </p>
            </div>

            {/* Login Card */}
            <div className="hero-stagger glass-card-strong overflow-hidden top-line-gradient p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="nim-input"
                    className="block text-xs font-medium text-slate-400 tracking-wide uppercase mb-2.5"
                  >
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
                    onChange={(e) => {
                      setNim(e.target.value);
                      setError("");
                      setNotFound(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3.5 bg-white/[0.04] border ${
                      error || notFound
                        ? "border-red-500/40 focus:border-red-500/60"
                        : "border-white/[0.08] focus:border-blue-500/50"
                    } text-white font-medium text-center tracking-[0.2em] placeholder:text-slate-500/60 placeholder:tracking-normal placeholder:text-sm outline-none transition-all duration-300 focus-ring-blue`}
                  />
                  {error && (
                    <p className="text-xs text-red-400/90 mt-2.5 flex items-center gap-1.5 justify-center">
                      <span className="w-1 h-1 rounded-full bg-red-400" />
                      {error}
                    </p>
                  )}
                  {notFound && (
                    <p className="text-xs text-red-400/80 mt-2.5 leading-relaxed text-center">
                      NIM tidak terdaftar dalam database peserta.
                      <br />
                      <span className="text-slate-500">Pastikan penulisan NIM sudah benar.</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !dataReady}
                  className="btn-primary-glow w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <span className="spin inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />
                        Memvalidasi...
                      </>
                    ) : (
                      <>Cek Hasil Seleksi →</>
                    )}
                  </span>
                </button>
              </form>
            </div>

            {/* Security note */}
            <p className="hero-stagger text-[11px] text-slate-500/60 text-center mt-6 tracking-wide">
              🔒 Data bersifat rahasia dan hanya dapat diakses oleh pemilik NIM
            </p>
          </div>
        ) : (
          /* ==================================================
             RESULT VIEW
             ================================================== */
          <div ref={resultRef} className="w-full space-y-10">
            {/* Result Header */}
            <div className="result-header text-center space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-emerald-400 bg-emerald-500/8 border border-emerald-400/20 uppercase badge-shimmer">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Lulus Seleksi
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Selamat Bergabung,{" "}
                <span className="text-gradient-gold">{applicant.nama}</span>
              </h1>
              <p className="text-sm text-slate-400">
                <span className="text-slate-500">NIM:</span> {applicant.nim}
                <span className="mx-2 text-slate-600">·</span>
                <span className="text-emerald-400 font-medium">Diterima</span>
              </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Main Info Card */}
                <div className="result-card glass-card-strong overflow-hidden top-line-gradient top-line-green p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-7">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 shrink-0">
                      ✓
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-slate-500 tracking-widest block uppercase">
                        Status Penerimaan
                      </span>
                      <h2 className="text-lg font-bold text-white leading-tight">
                        Diterima Sebagai Staf Muda
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-0">
                    {[
                      { label: "Nama Lengkap", value: applicant.nama, bold: true },
                      { label: "NIM", value: applicant.nim },
                      {
                        label: "Departemen",
                        value: deptInfo?.fullName ?? applicant.departemen,
                        highlight: true,
                      },
                      {
                        label: "Jabatan",
                        value: applicant.jabatan,
                        textCol: "text-[#C9A227]",
                      },
                      {
                        label: "Pelantikan",
                        value: "Segera diinfokan via grup koordinasi",
                        italic: true,
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center py-3.5 border-b border-white/[0.04] last:border-0"
                      >
                        <span className="text-[10px] font-medium tracking-widest text-slate-500 sm:w-1/3 mb-1 sm:mb-0 uppercase">
                          {row.label}
                        </span>
                        <span
                          className={`text-sm sm:w-2/3 ${
                            row.bold
                              ? "font-bold text-white text-[15px]"
                              : "text-slate-200"
                          } ${row.highlight ? "font-semibold text-blue-400" : ""} ${
                            row.textCol ?? ""
                          } ${row.italic ? "text-slate-400 text-[13px]" : ""}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Department Welcome */}
                {deptInfo && (
                  <div
                    className="result-card glass-card-strong overflow-hidden p-6 sm:p-8"
                    style={{
                      borderColor: `${deptInfo.color}22`,
                    }}
                  >
                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${deptInfo.color}, transparent)`,
                      }}
                    />

                    <h3 className="text-[10px] font-semibold tracking-[0.15em] text-slate-400 uppercase mb-6 flex items-center gap-2.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: deptInfo.color }}
                      />
                      Sambutan Ketua Departemen
                    </h3>

                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      <img
                        src={deptInfo.kadepPhoto}
                        alt={deptInfo.kadepName}
                        className="w-14 h-14 rounded-xl border border-white/10 bg-slate-800 shrink-0 shadow-lg"
                        style={{ borderColor: `${deptInfo.color}33` }}
                      />
                      <div className="space-y-3 flex-1">
                        <div className="leading-tight">
                          <h4 className="text-[15px] font-bold text-white">
                            {deptInfo.kadepName}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Ketua {deptInfo.fullName}
                          </span>
                        </div>

                        <div className="relative bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                          <span className="absolute -top-2.5 left-3 text-3xl text-white/[0.06] font-serif leading-none">
                            &ldquo;
                          </span>
                          <p className="text-[13px] leading-relaxed text-slate-300/90 italic pl-1">
                            {deptInfo.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-5 space-y-8">
                {/* 1. Personal Message from Azzam */}
                <div className="result-card glass-card-strong overflow-hidden border-[#C9A227]/15 p-6 sm:p-8">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C9A227]/[0.03] blur-2xl" />
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #C9A227, transparent)",
                    }}
                  />

                  <h3 className="text-[10px] font-semibold tracking-[0.15em] text-[#C9A227]/80 uppercase mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                    Pesan Ketua Umum
                  </h3>

                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Azzam"
                      alt="Ahmad Izzuddin Azzam"
                      className="w-12 h-12 rounded-xl border border-[#C9A227]/20 bg-slate-800 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Ahmad Izzuddin Azzam
                      </h4>
                      <span className="text-[10px] text-[#C9A227]/70 font-medium">
                        Ketua Umum · BEM TumbuhAsa
                      </span>
                    </div>
                  </div>

                  <div>
                    {personalMessage ? (
                      <div className="bg-[#C9A227]/[0.04] rounded-xl p-4 border border-[#C9A227]/10">
                        <p className="text-[13px] leading-relaxed text-slate-200/90 whitespace-pre-line italic">
                          &ldquo;{personalMessage}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                        <p className="text-[13px] leading-relaxed text-slate-400 italic">
                          &ldquo;Selamat bergabung di keluarga besar Rumah
                          Prestasi! Ini adalah langkah awal perjuangan barumu.
                          Jadikan setiap tantangan sebagai tempat berproses
                          terbaikmu. Aku menunggumu di pelantikan nanti!&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Surat Hangat */}
                <div className="result-card relative rounded-2xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl shadow-black/20 overflow-hidden border border-slate-200/80">
                  {/* Notebook lines */}
                  <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:100%_1.75rem]" />
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#C9A227]" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-[#1E3A8A] tracking-wide">
                          SURAT UNTUK KELUARGA BARU
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          BEM FPMIPA UPI 2026
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                        Mei 2026
                      </span>
                    </div>

                    <div className="text-[12px] leading-[1.8] text-slate-600 space-y-3 text-justify">
                      <p>
                        Assalamu&rsquo;alaikum Warahmatullahi Wabarakatuh,
                        salam hangat, dan salam prestasi! 🌟
                      </p>
                      <p>
                        Dengan penuh rasa bahagia dan bangga, kami menyambut
                        kehadiranmu. Kamu yang sedang membaca surat ini adalah
                        orang yang luar biasa — terpilih dari sekian banyak
                        pendaftar karena semangat dan potensi besarmu.
                      </p>
                      <p>
                        Rumah Prestasi hadir bukan sekadar wadah berorganisasi,
                        melainkan tempat bertumbuh, merajut mimpi, dan
                        berkolaborasi menciptakan dampak nyata bagi seluruh
                        mahasiswa FPMIPA.
                      </p>
                      <p>
                        Selamat berproses, tuangkan karya terbaikmu, dan mari
                        tunjukkan bersama bahwa{" "}
                        <strong className="text-[#1E3A8A]">
                          #FPMIPAJUARA
                        </strong>
                        !
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col items-end">
                      <span className="text-[10px] italic text-slate-400">
                        Tertanda hangat,
                      </span>
                      <span className="font-dancing text-2xl text-[#1E3A8A] mt-1 mb-1">
                        Azzam
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                        Ahmad Izzuddin Azzam
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="result-action flex justify-center pt-2">
              <button
                onClick={handleLogout}
                className="btn-ghost inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-medium text-slate-400 hover:text-white"
              >
                ← Kembali ke Halaman Utama
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer-section relative z-10 w-full py-10 px-6 border-t border-white/[0.04] bg-[#0a0f1e]/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="flex justify-center gap-3">
            {[
              {
                handle: "@rumahprestasi.fpmipa",
                href: "https://www.instagram.com/rumahprestasi.fpmipa",
              },
              {
                handle: "@fpmipaupiofficial",
                href: "https://www.instagram.com/fpmipaupiofficial",
              },
            ].map(({ handle, href }) => (
              <a
                key={handle}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium text-slate-400 hover:text-white"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                {handle}
              </a>
            ))}
          </div>

          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-500/70">
              © 2026 Rumah Prestasi FPMIPA UPI — Kabinet TumbuhAsa
            </p>
            <p className="text-[10px] text-slate-600/50">
              Universitas Pendidikan Indonesia · Bandung
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
