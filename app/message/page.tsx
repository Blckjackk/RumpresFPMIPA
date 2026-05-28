"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    if (!storedNim) { router.push("/nim"); } else { setNim(storedNim); }
  }, [router]);

  useEffect(() => {
    if (!containerRef.current || !nim) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".msg-header", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.1 });
      gsap.fromTo(".msg-panel", { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.2 });
    }, containerRef);
    return () => ctx.revert();
  }, [nim]);

  const handleStaffClick = (staff: typeof staffData[0]) => {
    setSelectedStaff(staff);
    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    const existing = messages.find((m: MessageData) => m.nim === nim && m.staffNim === staff.nim);
    if (existing) { setExistingMessage(existing); setMessage(existing.message); }
    else { setExistingMessage(null); setMessage(""); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !message.trim()) { alert("Mohon lengkapi semua field"); return; }
    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    const newMessage: MessageData = {
      nim, staffNim: selectedStaff.nim || "", staffName: selectedStaff.nama || "",
      message: message.trim(), response: existingMessage?.response || "",
      timestamp: existingMessage?.timestamp || new Date().toISOString(),
    };
    const existingIndex = messages.findIndex((m: MessageData) => m.nim === nim && m.staffNim === (selectedStaff.nim || ""));
    if (existingIndex >= 0) { messages[existingIndex] = newMessage; } else { messages.push(newMessage); }
    localStorage.setItem("messages", JSON.stringify(messages));
    alert("Pesan berhasil disimpan!");
    setExistingMessage(newMessage);
  };

  const getDivisionName = (divisionId: string) => {
    const division = divisionsData.find(d => d.id === divisionId);
    return division?.name || divisionId;
  };

  const filteredStaff = filterDivision === "all" ? staffData : staffData.filter(s => s.divisi === filterDivision);

  if (!nim) return null;

  return (
    <div ref={containerRef} className="relative min-h-screen p-4 py-8 bg-rp-gradient overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[350px] h-[350px] rounded-full bg-white/40 blur-[80px]" />
        <div className="absolute bottom-[-60px] right-[-40px] w-[280px] h-[280px] rounded-full bg-[#A8D8F0]/25 blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="msg-header card-white accent-line-blue overflow-hidden mb-6 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#0D2B4E]">Pesan & Kesan</h1>
              <p className="text-sm text-[#4A7BA5] mt-0.5">Pilih pengurus untuk memberikan pesan</p>
            </div>
            <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#EDF6FC] text-[#4A7BA5] border border-[#C2DFF0]">NIM: {nim}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Staff List */}
          <div className="msg-panel">
            <div className="card-white overflow-hidden">
              <div className="p-5 pb-4 border-b border-[#EDF6FC]">
                <h2 className="text-base font-bold text-[#0D2B4E] mb-3">Daftar Pengurus</h2>
                <Tabs value={filterDivision} onValueChange={setFilterDivision}>
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 bg-[#EDF6FC]">
                    {[
                      { value: "all", label: "Semua" }, { value: "nondivisi", label: "Non" },
                      { value: "psdm", label: "PSDM" }, { value: "adkesma", label: "ADKS" },
                      { value: "medinfo", label: "MED" }, { value: "kominfo", label: "KOM" },
                      { value: "kewirus", label: "KEW" }, { value: "litbang", label: "LIT" },
                      { value: "senbud", label: "SEN" },
                    ].map(tab => (
                      <TabsTrigger key={tab.value} value={tab.value} className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#1B5E9E] data-[state=active]:shadow-sm">
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <div className="max-h-[600px] overflow-y-auto p-3 space-y-1.5">
                {filteredStaff.map((staff) => (
                  <div
                    key={staff.nim}
                    className={`cursor-pointer rounded-xl p-3.5 transition-all duration-200 border ${
                      selectedStaff?.nim === staff.nim
                        ? "bg-[#1B5E9E]/5 border-[#1B5E9E]/25 shadow-sm"
                        : "bg-white border-transparent hover:bg-[#EDF6FC] hover:border-[#C2DFF0]"
                    }`}
                    onClick={() => handleStaffClick(staff)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-lg">
                        <AvatarImage src={staff.photo} alt={staff.nama} className="rounded-lg" />
                        <AvatarFallback className="bg-[#EDF6FC] text-[#1B5E9E] font-semibold text-xs rounded-lg">
                          {(staff.nama || "").split(' ').slice(0, 2).map(n => n[0] || '').join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#0D2B4E] truncate">{staff.nama}</p>
                        <p className="text-[11px] text-[#8AACCC]">{staff.nim}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#EDF6FC] text-[#4A7BA5] border border-[#D9EEF9]">
                        {getDivisionName(staff.divisi || "")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="msg-panel">
            {selectedStaff ? (
              <div className="card-white accent-line-blue overflow-hidden">
                <div className="p-5 pb-0">
                  <div className="flex items-center gap-3 mb-5">
                    <Avatar className="h-12 w-12 rounded-xl">
                      <AvatarImage src={selectedStaff.photo} alt={selectedStaff.nama} className="rounded-xl" />
                      <AvatarFallback className="bg-[#EDF6FC] text-[#1B5E9E] text-base font-bold rounded-xl">
                        {(selectedStaff.nama || "").split(' ').slice(0, 2).map(n => n[0] || '').join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-base font-bold text-[#0D2B4E]">{selectedStaff.nama || ""}</h3>
                      <p className="text-xs text-[#4A7BA5]">{selectedStaff.jabatan}</p>
                      <span className="badge-rp mt-1 text-[9px] py-0.5 px-2">{getDivisionName(selectedStaff.divisi || "")}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-[11px] font-semibold text-[#4A7BA5] tracking-wide uppercase">Pesan & Kesan Anda</Label>
                      <Textarea
                        id="message" placeholder="Tuliskan pesan dan kesan Anda..." value={message}
                        onChange={(e) => setMessage(e.target.value)} rows={6}
                        className="resize-none bg-[#EDF6FC] border-[#C2DFF0] text-[#0D2B4E] placeholder:text-[#A8C8E0] focus:border-[#3A8FD6]"
                      />
                      <p className="text-[11px] text-[#A8C8E0]">{message.length} karakter</p>
                    </div>

                    {existingMessage?.response && (
                      <div className="space-y-2">
                        <Label className="text-[11px] font-semibold text-[#B8931F] tracking-wide uppercase">Respon dari {selectedStaff.nama}</Label>
                        <div className="p-3.5 bg-[#FFFBEB] border border-[#F5E6A3]/40 rounded-xl">
                          <p className="text-sm whitespace-pre-wrap text-[#5D4A0F]">{existingMessage.response}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button type="button" onClick={() => router.push("/")} className="btn-light w-full py-3 text-sm rounded-xl">Kembali</button>
                      <button type="submit" className="btn-rp w-full py-3 text-sm">{existingMessage ? "Update Pesan" : "Kirim Pesan"}</button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card-white border-dashed border-[#C2DFF0] h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center py-12 px-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#EDF6FC] border border-[#C2DFF0] flex items-center justify-center text-2xl mx-auto mb-3">💬</div>
                  <p className="text-base font-semibold text-[#0D2B4E] mb-1">Pilih Pengurus</p>
                  <p className="text-sm text-[#4A7BA5] max-w-[220px] mx-auto">Klik pengurus di sebelah kiri untuk menulis pesan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
