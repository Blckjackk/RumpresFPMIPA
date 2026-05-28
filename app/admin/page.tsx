"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import staffData from "@/data/staff.json";
import gsap from "gsap";

interface Message {
  nim: string;
  staffNim: string;
  staffName: string;
  message: string;
  response: string;
  timestamp: string;
}

export default function AdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStaff, setFilterStaff] = useState("all");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem("messages") || "[]");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(storedMessages);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".admin-header",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        ".admin-stat",
        { y: 25, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(
        ".admin-content",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.5 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleRespond = (message: Message) => {
    setSelectedMessage(message);
    setResponseText(message.response || "");
    setIsDialogOpen(true);
  };

  const handleSaveResponse = () => {
    if (!selectedMessage) return;

    const updatedMessages = messages.map(msg => 
      msg.timestamp === selectedMessage.timestamp && msg.nim === selectedMessage.nim
        ? { ...msg, response: responseText }
        : msg
    );

    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    setIsDialogOpen(false);
    setSelectedMessage(null);
    setResponseText("");
  };

  const getStaffData = (staffNim: string) => {
    return staffData.find(s => s.nim === staffNim);
  };

  const filteredMessages = filterStaff === "all"
    ? messages
    : messages.filter(m => m.staffNim === filterStaff);

  const groupedByStaff = (staffData as any[]).reduce((acc, staff) => {
    if (staff && staff.nim) {
      acc[staff.nim] = messages.filter(m => m.staffNim === staff.nim).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: "Total Pesan", value: messages.length, color: "blue" },
    { label: "Sudah Dibalas", value: messages.filter(m => m.response).length, color: "gold" },
    { label: "Belum Dibalas", value: messages.filter(m => !m.response).length, color: "slate" },
    { label: "Total Pengurus", value: staffData.length, color: "blue" },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen p-4 py-8 bg-[#0a0f1e] text-slate-100 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-[#1E3A8A] opacity-20 blur-[140px]" />
        <div className="absolute bottom-[-80px] right-[-60px] w-[350px] h-[350px] rounded-full bg-[#6366F1] opacity-[0.08] blur-[130px]" />
        <div className="absolute inset-0 dot-pattern" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="admin-header glass-card-strong overflow-hidden top-line-gradient mb-6 p-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola dan balas pesan dari mahasiswa
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 mb-6 grid-cols-2 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="admin-stat glass-card overflow-hidden p-5">
              <div className={`text-2xl font-bold mb-1 ${
                stat.color === "blue" ? "text-blue-400" : 
                stat.color === "gold" ? "text-[#C9A227]" : "text-white"
              }`}>
                {stat.value}
              </div>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Messages Section */}
        <div className="admin-content glass-card-strong overflow-hidden">
          <div className="p-6 border-b border-white/[0.04]">
            <h2 className="text-lg font-bold text-white mb-4">Filter Berdasarkan Pengurus</h2>
            <select 
              className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm outline-none focus:border-blue-500/50 transition-colors"
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
            >
              <option value="all" className="bg-[#0f172a]">Semua Pengurus ({messages.length} pesan)</option>
              {(staffData as any[]).map(staff => {
                if (staff && staff.nim) {
                  const count = groupedByStaff[staff.nim] || 0;
                  if (count > 0) {
                    return (
                      <option key={staff.nim} value={staff.nim} className="bg-[#0f172a]">
                        {staff.nama} ({count} pesan)
                      </option>
                    );
                  }
                }
                return null;
              })}
            </select>
          </div>

          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-2xl mx-auto mb-3">
                  📭
                </div>
                <p className="text-sm text-slate-400">
                  Belum ada pesan {filterStaff !== "all" && "untuk pengurus ini"}
                </p>
              </div>
            ) : (
              filteredMessages.map((msg, idx) => {
                const staffInfo = getStaffData(msg.staffNim);
                return (
                  <div key={idx} className="glass-card overflow-hidden p-5 hover:border-white/[0.12] transition-all duration-300">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        {staffInfo && staffInfo.nama && (
                          <Avatar className="h-11 w-11 rounded-xl">
                            <AvatarImage src={staffInfo.photo} alt={staffInfo.nama} className="rounded-xl" />
                            <AvatarFallback className="bg-blue-500/10 text-blue-300 font-semibold text-xs rounded-xl">
                              {staffInfo.nama.split(' ').slice(0, 2).map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-white">Untuk: {msg.staffName}</span>
                            {msg.response && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-400/15">
                                ✓ Dibalas
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            NIM: {msg.nim} · {new Date(msg.timestamp).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">Pesan:</span>
                        <p className="mt-1.5 text-sm whitespace-pre-wrap bg-white/[0.03] p-3 rounded-lg border border-white/[0.04] text-slate-200/90">
                          {msg.message}
                        </p>
                      </div>
                      {msg.response && (
                        <div>
                          <span className="text-[10px] font-medium text-[#C9A227]/70 tracking-wide uppercase">Respon:</span>
                          <p className="mt-1.5 text-sm whitespace-pre-wrap bg-[#C9A227]/[0.04] border border-[#C9A227]/10 p-3 rounded-lg text-slate-200/90">
                            {msg.response}
                          </p>
                        </div>
                      )}
                      <Button 
                        onClick={() => handleRespond(msg)} 
                        className="w-full btn-primary-glow border-0 text-white font-medium h-10"
                      >
                        <span className="relative">{msg.response ? "Edit Respon" : "Balas Pesan"}</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl bg-[#0f172a] border-white/[0.08] text-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Balas Pesan</DialogTitle>
              <DialogDescription className="text-slate-400">
                Untuk: {selectedMessage?.staffName} · Dari NIM: {selectedMessage?.nim}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-slate-400 tracking-wide uppercase">Pesan dari mahasiswa:</Label>
                <div className="mt-2 p-4 bg-white/[0.03] rounded-xl text-sm border border-white/[0.04] text-slate-200/90">
                  {selectedMessage?.message}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="response" className="text-sm font-medium text-white">
                  Respon Anda:
                </Label>
                <Textarea
                  id="response"
                  placeholder="Tuliskan respon Anda di sini..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  className="resize-none bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-500/60 focus:border-blue-500/50"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full h-12 bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleSaveResponse} 
                  className="w-full h-12 btn-primary-glow border-0 text-white font-semibold"
                >
                  <span className="relative">Simpan Respon</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
