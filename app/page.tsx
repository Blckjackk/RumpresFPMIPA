"use client";

import { useState, useEffect, useRef } from "react";

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
        setDataReady(true); // fall back to active state
      }
    }
    load();
  }, []);

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
      // Find applicant
      const foundApplicant = applicantsList.find(
        (a) => a.nim === trimmed || a.nim.toLowerCase() === trimmed.toLowerCase()
      );

      if (!foundApplicant) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      // Find personal message from messages.json
      const foundMsg = messagesList.find(
        (m) => m.staffNim === foundApplicant.nim && m.message.trim() !== ""
      );

      // Find department details
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
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#091124] text-slate-100 font-sans selection:bg-[#C9A227] selection:text-[#091124]">
      {/* Background Soft Glow Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#1E3A8A] opacity-35 blur-[120px]" />
        <div className="absolute top-1/3 right-[-100px] w-96 h-96 rounded-full bg-[#C9A227] opacity-10 blur-[130px]" />
        <div className="absolute bottom-[-100px] left-1/3 w-[500px] h-[500px] rounded-full bg-[#3B82F6] opacity-15 blur-[150px]" />
      </div>

      {/* Header / Brand */}
      <header className="relative z-10 w-full px-6 py-5 border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] shadow-[0_4px_12px_rgba(59,130,246,0.3)] text-xl shrink-0">
              🏆
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold tracking-widest text-[#93C5FD] uppercase">
                Rumah Prestasi
              </span>
              <span className="text-[10px] text-slate-400">
                FPMIPA UPI — Open Recruitment 2026
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider px-3 py-1 rounded-full text-[#93C5FD] bg-[#93C5FD]/10 border border-[#93C5FD]/20">
              #FPMIPAJUARA
            </span>
            {applicant && (
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1 rounded-lg text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                Keluar 🚪
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-12 w-full max-w-7xl mx-auto">
        {!applicant ? (
          /* ==================================================
             LOGIN VIEW (NIM INPUT)
             ================================================== */
          <div className="w-full max-w-md hero-fade-1">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold tracking-widest text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/30 uppercase mb-4 shadow-sm animate-pulse">
                ✨ Pengumuman Seleksi
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                Selamat Datang, <br />
                <span className="bg-gradient-to-r from-[#93C5FD] via-[#3B82F6] to-[#C9A227] bg-clip-text text-transparent">
                  Sobat Prestasi!
                </span>
              </h1>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Silakan masukkan NIM kamu untuk melihat hasil seleksi Open Recruitment Rumah Prestasi 2026.
              </p>
            </div>

            {/* Login Card */}
            <div className="relative rounded-2xl bg-[#0f172a]/70 border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent" />

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="nim-input"
                    className="block text-xs font-semibold text-slate-400 tracking-widest uppercase mb-2"
                  >
                    Nomor Induk Mahasiswa (NIM)
                  </label>
                  <input
                    ref={inputRef}
                    id="nim-input"
                    type="text"
                    autoComplete="off"
                    placeholder="Masukkan NIM Anda (cth: 2401001)"
                    value={nim}
                    maxLength={10}
                    onChange={(e) => {
                      setNim(e.target.value);
                      setError("");
                      setNotFound(false);
                    }}
                    className={`w-full rounded-xl px-4 py-3 bg-white/5 border ${
                      error || notFound ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-[#3B82F6]"
                    } text-white font-medium text-center tracking-widest placeholder:text-slate-500 placeholder:tracking-normal outline-none transition-all duration-200`}
                  />
                  {error && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      ⚠️ {error}
                    </p>
                  )}
                  {notFound && (
                    <p className="text-xs text-red-400 mt-2 leading-relaxed">
                      ❌ NIM tidak terdaftar dalam database peserta. Pastikan penulisan NIM sudah benar atau hubungi panitia.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !dataReady}
                  className="relative group w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] px-5 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-50"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <span className="spin inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />
                        Memvalidasi Data...
                      </>
                    ) : (
                      <>🔑 Masuk & Cek Hasil</>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ==================================================
             RESULT VIEW (SUCCESS SCREEN)
             ================================================== */
          <div className="w-full space-y-8 pop-in">
            {/* Header Result */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 uppercase mb-4 shadow-sm animate-bounce">
                🎉 HASIL SELEKSI RESMI
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Selamat Bergabung, <span className="text-[#C9A227]">{applicant.nama}</span>!
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                NIM: {applicant.nim} · Status: <span className="text-[#10B981] font-semibold">Lulus Seleksi</span>
              </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Announcement & Department Welcoming (Size 7) */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* 1. Main Info Card */}
                <div className="relative rounded-2xl bg-[#0f172a]/80 border border-[#10B981]/20 p-6 sm:p-8 shadow-xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#10B981] via-[#3B82F6] to-[#10B981]" />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-2xl text-[#10B981]">
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 tracking-wider block">STATUS PENERIMAAN</span>
                      <h2 className="text-xl font-bold text-white leading-tight">Diterima Sebagai Staf Muda</h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "NAMA LENGKAP", value: applicant.nama, bold: true },
                      { label: "NIM", value: applicant.nim },
                      { label: "DEPARTEMEN", value: deptInfo?.fullName ?? applicant.departemen, highlight: true },
                      { label: "JABATAN", value: applicant.jabatan, textCol: "text-[#C9A227]" },
                      { label: "JADWAL PELANTIKAN", value: "🗓️ Segera Diinfokan Via Grup Koordinasi", italic: true }
                    ].map((row, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-white/5">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 sm:w-1/3 mb-1 sm:mb-0 uppercase">
                          {row.label}
                        </span>
                        <span className={`text-sm sm:w-2/3 ${row.bold ? "font-bold text-white text-base" : "text-slate-200"} ${row.highlight ? "font-bold text-[#3B82F6]" : ""} ${row.textCol ?? ""} ${row.italic ? "italic text-slate-400" : ""}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Welcome message from Head of Department */}
                {deptInfo && (
                  <div 
                    className="relative rounded-2xl bg-[#0f172a]/80 border p-6 sm:p-8 shadow-xl transition-all duration-300"
                    style={{ borderColor: `${deptInfo.color}33` }}
                  >
                    {/* Top glow decoration with department color */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ backgroundColor: deptInfo.color }}
                    />
                    
                    <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: deptInfo.color }} />
                      SAMBUTAN KETUA DEPARTEMEN
                    </h3>

                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      <img 
                        src={deptInfo.kadepPhoto} 
                        alt={deptInfo.kadepName}
                        className="w-16 h-16 rounded-2xl border bg-slate-800 border-white/10 shrink-0 shadow-md"
                        style={{ borderColor: `${deptInfo.color}44` }}
                      />
                      <div className="space-y-3">
                        <div className="leading-tight">
                          <h4 className="text-base font-bold text-white">{deptInfo.kadepName}</h4>
                          <span className="text-[11px] font-semibold text-slate-400">
                            Ketua {deptInfo.fullName}
                          </span>
                        </div>
                        
                        <div className="relative bg-white/5 rounded-xl p-4 border border-white/5">
                          {/* Quote mark decoration */}
                          <span className="absolute -top-3 left-3 text-4xl text-white/10 font-serif leading-none">“</span>
                          <p className="text-xs leading-relaxed text-slate-300 italic">
                            {deptInfo.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Surat Hangat & Azzam Details (Size 5) */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* 1. Personal Message from Azzam */}
                <div className="relative rounded-2xl bg-gradient-to-b from-[#111827] to-[#0f172a] border border-[#C9A227]/30 p-6 sm:p-8 shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C9A227]/5 blur-2xl" />
                  
                  <h3 className="text-xs font-bold tracking-widest text-[#C9A227] uppercase mb-6 flex items-center gap-1.5">
                    👑 PESAN KHUSUS KETUA UMUM
                  </h3>

                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Azzam" 
                      alt="Ahmad Izzuddin Azzam"
                      className="w-14 h-14 rounded-2xl border border-[#C9A227]/30 bg-slate-800 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">Ahmad Izzuddin Azzam</h4>
                      <span className="text-[10px] text-[#C9A227] font-semibold">Ketua Umum BEM TumbuhAsa</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {personalMessage ? (
                      <div className="bg-[#C9A227]/5 rounded-xl p-4 border border-[#C9A227]/10">
                        <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-line italic">
                          "{personalMessage}"
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-xs leading-relaxed text-slate-400 italic">
                          "Selamat bergabung di keluarga besar Rumah Prestasi! Ini adalah langkah awal perjuangan barumu. Jadikan setiap tantangan sebagai tempat berproses terbaikmu. Aku menunggumu di pelantikan nanti!"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Surat Hangat untuk Sobat Prestasi */}
                <div className="relative rounded-2xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl overflow-hidden border-2 border-[#C9A227]/40">
                  {/* Decorative notebook line pattern */}
                  <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:100%_2rem]" />
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#C9A227]" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-[#1E3A8A] tracking-wide">SURAT CINTA UNTUK KELUARGA BARU</h4>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">BEM FPMIPA UPI 2026</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Mei 2026</span>
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-700 space-y-3 text-justify">
                      <p>
                        Assalamu&rsquo;alaikum Warahmatullahi Wabarakatuh, salam hangat, dan salam prestasi! 🌟
                      </p>
                      <p>
                        Dengan penuh rasa bahagia dan bangga, kami menyambut kehadiranmu. Kamu yang sedang membaca surat ini adalah orang yang luar biasa, terpilih dari sekian banyak pendaftar karena semangat dan potensi besarmu.
                      </p>
                      <p>
                        Rumah Prestasi hadir bukan sekadar wadah berorganisasi, melainkan tempat bertumbuh, merajut mimpi, dan berkolaborasi menciptakan dampak nyata bagi seluruh mahasiswa FPMIPA.
                      </p>
                      <p>
                        Selamat berproses, tuangkan karya terbaikmu, dan mari tunjukkan bersama bahwa <strong className="text-[#1E3A8A]">#FPMIPAJUARA</strong>!
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col items-end">
                      <span className="text-[10px] italic text-slate-500">Tertanda hangat,</span>
                      <span className="font-dancing text-2xl text-[#1E3A8A] mt-1 mb-1">Azzam</span>
                      <span className="text-[9px] font-extrabold text-slate-400 tracking-wider">Ahmad Izzuddin Azzam</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-6 py-3 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md"
              >
                ⬅ Kembali ke Halaman Login
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 px-6 border-t border-white/5 bg-slate-950/40 text-center">
        <div className="max-w-7xl mx-auto space-y-4">
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
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
              >
                📸 {handle}
              </a>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            © 2026 Rumah Prestasi FPMIPA UPI — Kabinet TumbuhAsa <br />
            Universitas Pendidikan Indonesia · Bandung · Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}

