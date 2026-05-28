"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import staffData from "@/data/staff.json";
import divisionsData from "@/data/divisions.json";
import gsap from "gsap";

interface MessageData {
  nim: string;
  staffNim: string;
  staffName: string;
  message: string;
  response: string;
  timestamp: string;
}

export default function MessagePage() {
  const [nim, setNim] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<typeof staffData[0] | null>(null);
  const [message, setMessage] = useState("");
  const [existingMessage, setExistingMessage] = useState<MessageData | null>(null);
  const [filterDivision, setFilterDivision] = useState("all");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedNim = sessionStorage.getItem("userNIM");
    if (!storedNim) {
      router.push("/nim");
    } else {
      setNim(storedNim);
    }
  }, [router]);

  useEffect(() => {
    if (!containerRef.current || !nim) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".msg-header",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        ".msg-panel",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.25 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [nim]);

  const handleStaffClick = (staff: typeof staffData[0]) => {
    setSelectedStaff(staff);
    
    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    const existing = messages.find(
      (m: MessageData) => m.nim === nim && m.staffNim === staff.nim
    );
    
    if (existing) {
      setExistingMessage(existing);
      setMessage(existing.message);
    } else {
      setExistingMessage(null);
      setMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaff || !message.trim()) {
      alert("Mohon lengkapi semua field");
      return;
    }

    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    const newMessage: MessageData = {
      nim,
      staffNim: selectedStaff.nim || "",
      staffName: selectedStaff.nama || "",
      message: message.trim(),
      response: existingMessage?.response || "",
      timestamp: existingMessage?.timestamp || new Date().toISOString(),
    };

    const existingIndex = messages.findIndex(
      (m: MessageData) => m.nim === nim && m.staffNim === (selectedStaff.nim || "")
    );
    
    if (existingIndex >= 0) {
      messages[existingIndex] = newMessage;
    } else {
      messages.push(newMessage);
    }
    
    localStorage.setItem("messages", JSON.stringify(messages));
    alert("Pesan berhasil disimpan!");
    setExistingMessage(newMessage);
  };

  const getDivisionName = (divisionId: string) => {
    const division = divisionsData.find(d => d.id === divisionId);
    return division?.name || divisionId;
  };

  const filteredStaff = filterDivision === "all" 
    ? staffData 
    : staffData.filter(s => s.divisi === filterDivision);

  if (!nim) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative min-h-screen p-4 py-8 bg-[#0a0f1e] text-slate-100 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-[#1E3A8A] opacity-20 blur-[140px]" />
        <div className="absolute bottom-[-80px] right-[-60px] w-[350px] h-[350px] rounded-full bg-[#6366F1] opacity-[0.08] blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-[#3B82F6] opacity-[0.06] blur-[120px]" />
        <div className="absolute inset-0 dot-pattern" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="msg-header glass-card-strong overflow-hidden top-line-gradient mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Pesan & Kesan</h1>
              <p className="text-sm text-slate-400 mt-1">
                Pilih pengurus untuk memberikan pesan dan kesan
              </p>
            </div>
            <div className="inline-flex items-center text-xs font-medium px-3.5 py-1.5 rounded-lg text-slate-300 bg-white/[0.04] border border-white/[0.08]">
              NIM: {nim}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Side - Staff List */}
          <div className="msg-panel">
            <div className="glass-card-strong overflow-hidden p-0">
              <div className="p-6 pb-4 border-b border-white/[0.04]">
                <h2 className="text-lg font-bold text-white mb-4">Daftar Pengurus</h2>
                <Tabs value={filterDivision} onValueChange={setFilterDivision}>
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 bg-white/[0.04]">
                    <TabsTrigger value="all" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">Semua</TabsTrigger>
                    <TabsTrigger value="nondivisi" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">Non</TabsTrigger>
                    <TabsTrigger value="psdm" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">PSDM</TabsTrigger>
                    <TabsTrigger value="adkesma" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">ADKS</TabsTrigger>
                    <TabsTrigger value="medinfo" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">MED</TabsTrigger>
                    <TabsTrigger value="kominfo" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">KOM</TabsTrigger>
                    <TabsTrigger value="kewirus" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">KEW</TabsTrigger>
                    <TabsTrigger value="litbang" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">LIT</TabsTrigger>
                    <TabsTrigger value="senbud" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">SEN</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="max-h-[600px] overflow-y-auto p-4 space-y-2">
                {filteredStaff.map((staff) => (
                  <div 
                    key={staff.nim}
                    className={`cursor-pointer rounded-xl p-4 transition-all duration-300 border ${
                      selectedStaff?.nim === staff.nim 
                        ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5' 
                        : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.1]'
                    }`}
                    onClick={() => handleStaffClick(staff)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage src={staff.photo} alt={staff.nama} className="rounded-lg" />
                        <AvatarFallback className="bg-blue-500/10 text-blue-300 font-semibold text-xs rounded-lg">
                          {(staff.nama || "").split(' ').slice(0, 2).map(n => n[0] || '').join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{staff.nama}</p>
                        <p className="text-[11px] text-slate-500">{staff.nim}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400">
                        {getDivisionName(staff.divisi || "")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Message Form */}
          <div className="msg-panel">
            {selectedStaff ? (
              <div className="glass-card-strong overflow-hidden top-line-gradient">
                <div className="p-6 pb-0">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-14 w-14 rounded-xl">
                      <AvatarImage src={selectedStaff.photo} alt={selectedStaff.nama} className="rounded-xl" />
                      <AvatarFallback className="bg-blue-500/10 text-blue-300 text-lg font-bold rounded-xl">
                        {(selectedStaff.nama || "").split(' ').slice(0, 2).map(n => n[0] || '').join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedStaff.nama || ""}</h3>
                      <p className="text-xs text-slate-400">{selectedStaff.jabatan}</p>
                      <span className="inline-flex items-center text-[10px] font-medium mt-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-400/15">
                        {getDivisionName(selectedStaff.divisi || "")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                        Pesan & Kesan Anda
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tuliskan pesan dan kesan Anda untuk pengurus ini..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="resize-none bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-500/60 focus:border-blue-500/50"
                      />
                      <p className="text-[11px] text-slate-500/60">
                        {message.length} karakter
                      </p>
                    </div>

                    {existingMessage?.response && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-[#C9A227]/80 tracking-wide uppercase">
                          Respon dari {selectedStaff.nama}
                        </Label>
                        <div className="p-4 bg-[#C9A227]/[0.04] border border-[#C9A227]/15 rounded-xl">
                          <p className="text-sm whitespace-pre-wrap text-slate-200/90">
                            {existingMessage.response}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/")}
                        className="w-full h-12 bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.16]"
                      >
                        Kembali
                      </Button>
                      <Button 
                        type="submit" 
                        className="w-full h-12 btn-primary-glow border-0 text-white font-semibold"
                      >
                        <span className="relative">{existingMessage ? "Update Pesan" : "Kirim Pesan"}</span>
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="glass-card-strong border-dashed border-white/10 h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/8 border border-blue-400/10 flex items-center justify-center text-3xl mx-auto mb-4">
                    💬
                  </div>
                  <p className="text-base font-semibold text-white mb-1">Pilih Pengurus</p>
                  <p className="text-sm text-slate-400 max-w-[240px] mx-auto">
                    Klik salah satu pengurus di sebelah kiri untuk mulai menulis pesan
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
