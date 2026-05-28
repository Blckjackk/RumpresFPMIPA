"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import gsap from "gsap";

export default function NIMPage() {
  const [nim, setNim] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".nim-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.15 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nim || nim.trim().length === 0) {
      setError("NIM tidak boleh kosong");
      return;
    }

    if (nim.length < 5) {
      setError("NIM tidak valid");
      return;
    }

    sessionStorage.setItem("userNIM", nim);
    router.push("/message");
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center p-4 bg-[#0a0f1e] text-slate-100 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-[#1E3A8A] opacity-20 blur-[140px]" />
        <div className="absolute bottom-[-80px] right-[-60px] w-[350px] h-[350px] rounded-full bg-[#3B82F6] opacity-[0.1] blur-[130px]" />
        <div className="absolute inset-0 dot-pattern" />
      </div>

      <div className="nim-card relative z-10 w-full max-w-md">
        <div className="glass-card-strong overflow-hidden top-line-gradient p-8">
          <div className="space-y-3 text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-blue-300/70 bg-blue-500/8 border border-blue-400/10 uppercase badge-shimmer">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
              Kabinet TumbuhAsa
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Pesan & Kesan
            </h1>
            <p className="text-sm text-slate-400">
              Masukkan NIM Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nim" className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                NIM
              </Label>
              <Input
                id="nim"
                type="text"
                placeholder="Contoh: 2300492"
                value={nim}
                onChange={(e) => {
                  setNim(e.target.value);
                  setError("");
                }}
                className={`h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-500/60 focus:border-blue-500/50 focus-ring-blue ${error ? "border-red-500/40" : ""}`}
              />
              {error && (
                <p className="text-xs text-red-400/80 font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400" />
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.16]"
                onClick={() => router.push("/")}
              >
                Kembali
              </Button>
              <Button type="submit" className="w-full h-12 btn-primary-glow border-0 text-white font-semibold">
                <span className="relative">Lanjutkan →</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
