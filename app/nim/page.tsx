"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import gsap from "gsap";

export default function NIMPage() {
  const [nim, setNim] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".nim-card", { y: 25, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.15,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim || nim.trim().length === 0) { setError("NIM tidak boleh kosong"); return; }
    if (nim.length < 5) { setError("NIM tidak valid"); return; }
    sessionStorage.setItem("userNIM", nim);
    router.push("/message");
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center p-4 bg-rp-hero overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full bg-white/40 blur-[80px]" />
        <div className="absolute bottom-[-60px] right-[-40px] w-[280px] h-[280px] rounded-full bg-[#A8D8F0]/25 blur-[90px]" />
      </div>

      <div className="nim-card relative z-10 w-full max-w-md">
        <div className="card-white accent-line-blue overflow-hidden p-7">
          <div className="space-y-2.5 text-center mb-7">
            <div className="badge-rp mx-auto">Kabinet TumbuhAsa</div>
            <h1 className="text-2xl font-bold text-[#0D2B4E]">Pesan & Kesan</h1>
            <p className="text-sm text-[#4A7BA5]">Masukkan NIM Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nim" className="text-[11px] font-semibold text-[#4A7BA5] tracking-wide uppercase">NIM</Label>
              <Input
                id="nim" type="text" placeholder="Contoh: 2300492"
                value={nim}
                onChange={(e) => { setNim(e.target.value); setError(""); }}
                className={`h-12 bg-[#EDF6FC] border-[#C2DFF0] text-[#0D2B4E] placeholder:text-[#A8C8E0] focus:border-[#3A8FD6] focus-ring ${error ? "border-red-400" : ""}`}
              />
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.push("/")} className="btn-light w-full py-3 text-sm rounded-xl">Kembali</button>
              <button type="submit" className="btn-rp w-full py-3 text-sm">Lanjutkan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
