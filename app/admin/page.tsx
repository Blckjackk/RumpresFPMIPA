"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
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
      gsap.fromTo(".admin-header", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.1 });
      gsap.fromTo(".admin-stat", { y: 20, opacity: 0, scale: 0.97 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: "power2.out", delay: 0.2,
      });
      gsap.fromTo(".admin-content", { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.45 });
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
        ? { ...msg, response: responseText } : msg
    );
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    setIsDialogOpen(false);
    setSelectedMessage(null);
    setResponseText("");
  };

  const getStaffData = (staffNim: string) => staffData.find(s => s.nim === staffNim);

  const filteredMessages = filterStaff === "all" ? messages : messages.filter(m => m.staffNim === filterStaff);

  const groupedByStaff = (staffData as any[]).reduce((acc, staff) => {
    if (staff && staff.nim) { acc[staff.nim] = messages.filter(m => m.staffNim === staff.nim).length; }
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: "Total Pesan", value: messages.length, variant: "blue" as const },
    { label: "Sudah Dibalas", value: messages.filter(m => m.response).length, variant: "green" as const },
    { label: "Belum Dibalas", value: messages.filter(m => !m.response).length, variant: "gold" as const },
    { label: "Total Pengurus", value: staffData.length, variant: "blue" as const },
  ];

  const variantColors = {
    blue: "text-[#1B5E9E]",
    green: "text-emerald-600",
    gold: "text-[#B8931F]",
  };

  return (
    <div ref={containerRef} className="relative min-h-screen p-4 py-8 bg-rp-gradient overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[350px] h-[350px] rounded-full bg-white/40 blur-[80px]" />
        <div className="absolute bottom-[-60px] right-[-40px] w-[280px] h-[280px] rounded-full bg-[#A8D8F0]/25 blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="admin-header card-white accent-line-blue overflow-hidden mb-6 p-5">
          <h1 className="text-xl font-bold text-[#0D2B4E]">Admin Dashboard</h1>
          <p className="text-sm text-[#4A7BA5] mt-0.5">Kelola dan balas pesan dari mahasiswa</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 mb-6 grid-cols-2 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="admin-stat card-white p-5">
              <div className={`text-2xl font-bold mb-0.5 ${variantColors[stat.variant]}`}>{stat.value}</div>
              <p className="text-xs text-[#4A7BA5]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="admin-content card-white overflow-hidden">
          <div className="p-5 border-b border-[#EDF6FC]">
            <h2 className="text-base font-bold text-[#0D2B4E] mb-3">Filter Berdasarkan Pengurus</h2>
            <select
              className="w-full p-2.5 rounded-xl bg-[#EDF6FC] border border-[#C2DFF0] text-[#0D2B4E] text-sm outline-none focus:border-[#3A8FD6] transition-colors"
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
            >
              <option value="all">Semua Pengurus ({messages.length} pesan)</option>
              {(staffData as any[]).map(staff => {
                if (staff && staff.nim) {
                  const count = groupedByStaff[staff.nim] || 0;
                  if (count > 0) return <option key={staff.nim} value={staff.nim}>{staff.nama} ({count} pesan)</option>;
                }
                return null;
              })}
            </select>
          </div>

          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-12 h-12 rounded-2xl bg-[#EDF6FC] border border-[#C2DFF0] flex items-center justify-center text-xl mx-auto mb-2.5">📭</div>
                <p className="text-sm text-[#4A7BA5]">Belum ada pesan {filterStaff !== "all" && "untuk pengurus ini"}</p>
              </div>
            ) : (
              filteredMessages.map((msg, idx) => {
                const staffInfo = getStaffData(msg.staffNim);
                return (
                  <div key={idx} className="rounded-xl p-4 bg-white border border-[#EDF6FC] hover:border-[#C2DFF0] hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start gap-3 mb-3">
                      {staffInfo && staffInfo.nama && (
                        <Avatar className="h-10 w-10 rounded-lg">
                          <AvatarImage src={staffInfo.photo} alt={staffInfo.nama} className="rounded-lg" />
                          <AvatarFallback className="bg-[#EDF6FC] text-[#1B5E9E] font-semibold text-xs rounded-lg">
                            {staffInfo.nama.split(' ').slice(0, 2).map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#0D2B4E]">Untuk: {msg.staffName}</span>
                          {msg.response && (
                            <span className="badge-success text-[9px] py-0.5 px-2">✓ Dibalas</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8AACCC] mt-0.5">NIM: {msg.nim} · {new Date(msg.timestamp).toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <span className="text-[10px] font-semibold text-[#8AACCC] tracking-wide uppercase">Pesan:</span>
                        <p className="mt-1 text-sm whitespace-pre-wrap bg-[#F7FBFE] p-3 rounded-lg border border-[#EDF6FC] text-[#2D4A6A]">{msg.message}</p>
                      </div>
                      {msg.response && (
                        <div>
                          <span className="text-[10px] font-semibold text-[#B8931F] tracking-wide uppercase">Respon:</span>
                          <p className="mt-1 text-sm whitespace-pre-wrap bg-[#FFFBEB] border border-[#F5E6A3]/40 p-3 rounded-lg text-[#5D4A0F]">{msg.response}</p>
                        </div>
                      )}
                      <button onClick={() => handleRespond(msg)} className="btn-rp w-full py-2.5 text-sm">
                        {msg.response ? "Edit Respon" : "Balas Pesan"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl bg-white border-[#C2DFF0] text-[#0D2B4E]">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#0D2B4E]">Balas Pesan</DialogTitle>
              <DialogDescription className="text-[#4A7BA5]">
                Untuk: {selectedMessage?.staffName} · Dari NIM: {selectedMessage?.nim}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-[11px] font-semibold text-[#4A7BA5] tracking-wide uppercase">Pesan dari mahasiswa:</Label>
                <div className="mt-2 p-3.5 bg-[#F7FBFE] rounded-xl text-sm border border-[#EDF6FC] text-[#2D4A6A]">{selectedMessage?.message}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="response" className="text-sm font-semibold text-[#0D2B4E]">Respon Anda:</Label>
                <Textarea
                  id="response" placeholder="Tuliskan respon Anda di sini..."
                  value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={6}
                  className="resize-none bg-[#EDF6FC] border-[#C2DFF0] text-[#0D2B4E] placeholder:text-[#A8C8E0] focus:border-[#3A8FD6]"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsDialogOpen(false)} className="btn-light w-full py-3 text-sm rounded-xl">Batal</button>
                <button onClick={handleSaveResponse} className="btn-rp w-full py-3 text-sm">Simpan Respon</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
