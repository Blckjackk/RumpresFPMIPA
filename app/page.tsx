"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ======================================================
   UTILITY: Reduced motion check
   ====================================================== */
const getReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getIsTouch = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

/* ======================================================
   TYPES
   ====================================================== */
interface ApplicantData {
  nim: string;
  nama: string;
  departemen: string;
  jabatan: string;
  divisi?: string;
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
  leaders?: { name: string; role: string; photo: string; message: string; }[];
}

/* ======================================================
   LANDING CONSTANTS
   ====================================================== */
const LANDING_DEPARTMENTS = [
  {
    title: "Media dan Informasi",
    tagline: "Mata, Suara, dan Publikasi Kreatif",
    desc: "Menjadi jembatan informasi bagi seluruh elemen Rumah Prestasi dengan memproduksi publikasi visual, desain grafis, multimedia, serta jurnalistik yang kreatif dan menginspirasi.",
    icon: "/divisions/medinfo.svg",
    color: "#06B6D4",
    badge: "MEDIA & CREATIVE",
    feltAppleColor: "#06B6D4",
    rotation: "-3deg",
    photo: "/divisions/kadep_media_dan_informasi.jpg"
  },
  {
    title: "Teknologi dan Rekayasa",
    tagline: "Inovasi Sistem & Platform Digital",
    desc: "Membangun sistem, infrastruktur digital, and platform web yang andal, solutif, serta menunjang transformasi digital seluruh program kerja di Rumah Prestasi.",
    icon: "/divisions/kominfo.svg",
    color: "#1E40AF",
    badge: "DIGITAL & SYSTEM",
    feltAppleColor: "#1E40AF",
    rotation: "2deg",
    photo: "/divisions/kadep_teknologi_dan_rekayasa.jpg"
  },
  {
    title: "Pengembangan Sumber Daya Talenta (PSDT)",
    tagline: "Kaderisasi & Pelatihan Kepemimpinan",
    desc: "Fokus pada pemberdayaan potensi talenta, mengelola sistem kaderisasi berkelanjutan, menyelenggarakan pelatihan kepemimpinan, dan membangun keakraban internal.",
    icon: "/divisions/psdm.svg",
    color: "#3B82F6",
    badge: "LEADERSHIP & TALENT",
    feltAppleColor: "#3B82F6",
    rotation: "-4deg",
    photo: "/divisions/kadep_psdt.jpg"
  },
  {
    title: "Riset dan Kreatifitas",
    tagline: "Inkubasi Inovasi & Gagasan Baru",
    desc: "Mendorong iklim berpikir kritis, riset inovatif, inkubasi gagasan, serta memfasilitasi keikutsertaan pengurus dalam ajang kompetisi nasional.",
    icon: "/divisions/litbang.svg",
    color: "#10B981",
    badge: "RESEARCH & CREATIVE",
    feltAppleColor: "#10B981",
    rotation: "3deg",
    photo: "/divisions/kadep_riset_dan_kreatifitas.jpg"
  },
  {
    title: "Penalaran dan Literasi",
    tagline: "Budaya Membaca & Kajian Akademis",
    desc: "Membudayakan kegemaran membaca, berdiskusi ilmiah secara kritis, dan menyusun kajian strategis untuk menyebarkan kebermanfaatan ilmu pengetahuan.",
    icon: "/divisions/litbang.svg",
    color: "#8B5CF6",
    badge: "ACADEMIC & LITERACY",
    feltAppleColor: "#8B5CF6",
    rotation: "-2deg",
    photo: "/divisions/kadep_penalaran_dan_literasi.jpg"
  },
  {
    title: "Seni dan Karakter",
    tagline: "Imajinasi, Ekspresi, & Seni Budaya",
    desc: "Wadah kreativitas seni dan budaya untuk memperindah Rumah Prestasi. Mengembangkan potensi bakat non-akademis pengurus dalam suasana yang harmonis.",
    icon: "/divisions/senbud.svg",
    color: "#EC4899",
    badge: "ARTS & CULTURE",
    feltAppleColor: "#EC4899",
    rotation: "2deg",
    photo: "/divisions/kadep_seni_dan_karakter.jpg"
  },
  {
    title: "Sertifikasi",
    tagline: "Standardisasi & Sertifikasi Profesional",
    desc: "Meningkatkan daya saing dan keahlian pengurus melalui persiapan program pelatihan kompetensi serta standarisasi keahlian untuk masa depan karir.",
    icon: "/divisions/nondivisi.svg",
    color: "#F59E0B",
    badge: "PROFESSIONAL COMPETENCY",
    feltAppleColor: "#F59E0B",
    rotation: "-3deg",
    photo: "/divisions/kadep_sertifikasi.jpg"
  },
  {
    title: "Kewirausahaan dan Karir",
    tagline: "Kemandirian Finansial & Mental Bisnis",
    desc: "Mengembangkan jiwa entrepreneurship melalui unit usaha kreatif, merchandise, dan kolaborasi finansial guna mewujudkan kemandirian ekonomi organisasi.",
    icon: "/divisions/kewirus.svg",
    color: "#10B981",
    badge: "BUSINESS & FINTECH",
    feltAppleColor: "#10B981",
    rotation: "3deg",
    photo: "/divisions/kadep_kewirausaan_dan_karir.jpg"
  },
  {
    title: "Sekretaris Umum",
    tagline: "Administrasi & Pengarsipan Presisi",
    desc: "Mengelola administrasi surat-menyurat, pengarsipan berkas penting, koordinasi agenda kerja kabinet, and menyusun laporan pertanggungjawaban secara teratur.",
    icon: "/divisions/nondivisi.svg",
    color: "#6B7280",
    badge: "ADMINISTRATION & SECRETARIAT",
    feltAppleColor: "#6B7280",
    rotation: "1deg",
    photo: "/divisions/sekretaris.jpg"
  },
  {
    title: "Bendahara Umum",
    tagline: "Transparansi & Pengelolaan Keuangan",
    desc: "Mengelola arus kas keuangan kabinet, penyusunan anggaran kegiatan, pengawasan realisasi dana, and menyusun laporan keuangan bulanan secara transparan.",
    icon: "/divisions/nondivisi.svg",
    color: "#10B981",
    badge: "FINANCE & TREASURY",
    feltAppleColor: "#10B981",
    rotation: "-2deg",
    photo: "/divisions/bendahara.jpg"
  }
];

const getDeptId = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("media")) return "medinfo";
  if (t.includes("teknologi")) return "teknologi";
  if (t.includes("psdt") || t.includes("sumber daya talenta")) return "psdt";
  if (t.includes("riset")) return "riset";
  if (t.includes("penalaran") || t.includes("literasi")) return "literasi";
  if (t.includes("seni")) return "seni";
  if (t.includes("sertifikasi")) return "sertifikasi";
  if (t.includes("wirausaha")) return "kewirausahaan";
  if (t.includes("sekretaris")) return "sekretaris";
  if (t.includes("bendahara")) return "bendahara";
  return "";
};

/* ======================================================
   PAGE COMPONENT
   ====================================================== */
export default function Home() {
  const [nim, setNim] = useState("");
  const [applicant, setApplicant] = useState<ApplicantData | null>(null);
  const [personalMessage, setPersonalMessage] = useState<string>("");
  const [deptInfo, setDeptInfo] = useState<DepartmentData | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Resolve leader1 and leader2 for the results cards split
  const getDepartmentLeaders = (dept: DepartmentData | null, app: ApplicantData | null) => {
    if (!dept || !dept.leaders || dept.leaders.length === 0) return { leader1: null, leader2: null };

    const l1 = dept.leaders[0];
    let l2 = null;

    if (dept.leaders.length === 2) {
      l2 = dept.leaders[1];
    } else if (dept.leaders.length === 3 && app) {
      const div = app.divisi || "";
      const matched = dept.leaders.slice(1).find(l =>
        l.role.toLowerCase().includes(div.toLowerCase())
      );
      l2 = matched || dept.leaders[1];
    }
    return { leader1: l1, leader2: l2 };
  };

  const { leader1, leader2 } = getDepartmentLeaders(deptInfo, applicant);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [applicantsList, setApplicantsList] = useState<ApplicantData[]>([]);
  const [messagesList, setMessagesList] = useState<MessageData[]>([]);
  const [departmentsList, setDepartmentsList] = useState<DepartmentData[]>([]);
  const [dataReady, setDataReady] = useState(false);

  // Responsive state and Premium Interactive helpers
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isTouch, setIsTouch] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Unboxing & Celebration Scene States
  const [scene, setScene] = useState<"login" | "intro" | "envelope" | "letters" | "celebration">("login");
  const [activeLetter, setActiveLetter] = useState(0);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  // Landing Carousel Active Card
  const [activeLandingCard, setActiveLandingCard] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const sparkleContainerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const headingUnderlineRef = useRef<HTMLHeadingElement>(null);

  // Refs for click-to-burst particles and sound contexts
  const particlesRef = useRef<any[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 0A. Pure-JS real-time Web Audio API synthesizer for satisfying SFX (100% offline-compatible)
  const playSFX = useCallback((type: "pop" | "whoosh" | "chimes") => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === "pop") {
        // Satisfying physical wax seal crack/pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "whoosh") {
        // Satisfying paper flip / slide whoosh
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(1100, now + 0.12);
        filter.frequency.exponentialRampToValueAtTime(350, now + 0.3);
        filter.Q.value = 2.2;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
      } else if (type === "chimes") {
        // Ascending magical pentatonic arpeggio sweep for selebrasi
        const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.045, now + idx * 0.04 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.35);
        });
      }
    } catch (e) {
      console.warn("Failed playing SFX:", e);
    }
  }, [isMuted]);



  // 0C. Click-to-Burst cursor confetti emitter
  const handlePageClick = (e: React.MouseEvent) => {
    if (scene !== "celebration" || !canvasRef.current) return;
    const colors = ["#C36B62", "#D4A828", "#5B6B54", "#B8A88A", "#1B5E9E"];
    const shapes = ["rect", "circle", "star"];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x: x,
        y: y,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: -(Math.random() * 4 + 2),
        speedX: (Math.random() - 0.5) * 6,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
        shape: shapes[Math.floor(Math.random() * shapes.length)] as any,
      });
    }
  };

  // 0D. Prefilled WA coordinator contact redirect URL
  const getWhatsAppLink = () => {
    if (!applicant) return "#";
    const waText = encodeURIComponent(
      `Halo Kak! Saya *${applicant.nama}* (NIM: *${applicant.nim}*), dinyatakan lolos seleksi dan diterima sebagai *${applicant.jabatan}* di Departemen *${deptInfo?.fullName ?? applicant.departemen}* Rumah Prestasi 2026.\n\nSaya ingin mengonfirmasi kelulusan saya. Terima kasih banyak kak! #JuaranyaFPMIPA`
    );
    return `https://wa.me/62895325785002?text=${waText}`;
  };

  // Window Resize & Client detection (prevents hydration mismatch)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      setIsTouch(getIsTouch());
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // 1. Intro Transition Timer
  useEffect(() => {
    if (scene !== "intro") return;
    const timer = setTimeout(() => {
      setScene("envelope");
    }, 2400);
    return () => clearTimeout(timer);
  }, [scene]);

  // 1b. Celebration sound effect observer
  useEffect(() => {
    if (scene === "celebration") {
      playSFX("chimes");
    }
  }, [scene, playSFX]);

  // 2. Multi-burst Confetti + Sparkle Stars for Celebration Scene
  useEffect(() => {
    if (scene !== "celebration" || !canvasRef.current) return;
    if (getReducedMotion()) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationId: number;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedY: number;
      speedX: number;
      rotation: number;
      rotationSpeed: number;
      shape: "rect" | "circle" | "star";
    }

    const colors = ["#C36B62", "#D4A828", "#5B6B54", "#B8A88A", "#1B5E9E"];
    const shapes: Particle["shape"][] = ["rect", "circle", "star"];

    // Multi-burst: 3 waves from different origins
    const createBurst = (originX: number, originY: number, count: number, delay: number) => {
      setTimeout(() => {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: originX * width,
            y: originY * height,
            size: Math.random() * 5 + 3, // Smaller, more elegant particles
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: -(Math.random() * 5 + 3),
            speedX: (Math.random() - 0.5) * 6,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
          });
        }
      }, delay);
    };

    particlesRef.current = [];
    const particles = particlesRef.current;
    // Elegant, smaller burst waves
    createBurst(0.15, 0.6, 40, 0);   // left
    createBurst(0.85, 0.6, 40, 200); // right
    createBurst(0.5, 0.25, 50, 400); // top center

    const gravity = 0.12;

    const drawStar = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const method = i === 0 ? "moveTo" : "lineTo";
        ctx[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();
    };

    const update = () => {
      ctx.clearRect(0, 0, width, height);

      // Filter out particles that fell off the screen (no infinite recycling loop)
      const activeParticles = particles.filter(p => p.y <= height + 20);
      particles.length = 0;
      particles.push(...activeParticles);

      particles.forEach(p => {
        p.speedY += gravity;
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "star") {
          drawStar(0, 0, p.size / 2);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      });
      animationId = requestAnimationFrame(update);
    };

    update();

    // Sparkle stars around celebration text
    if (sparkleContainerRef.current) {
      const container = sparkleContainerRef.current;
      const sparkleChars = ["✦", "✧", "⟡", "✩", "❋"];
      for (let i = 0; i < 25; i++) {
        setTimeout(() => {
          const sparkle = document.createElement("span");
          sparkle.className = "sparkle";
          sparkle.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
          sparkle.style.left = `${Math.random() * 100}%`;
          sparkle.style.top = `${Math.random() * 100}%`;
          sparkle.style.fontSize = `${Math.random() * 16 + 10}px`;
          sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];
          container.appendChild(sparkle);
          setTimeout(() => sparkle.remove(), 1400);
        }, i * 180);
      }
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [scene]);

  // 2b. Ambient Particle Background (envelope & letters scenes)
  useEffect(() => {
    if (!applicant || !particleCanvasRef.current) return;
    if (scene !== "envelope" && scene !== "letters" && scene !== "intro") return;
    if (getReducedMotion()) return;
    const canvas = particleCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;
    let mouseX = -9999;
    let mouseY = -9999;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const handleMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    const isMobile = getIsTouch();
    const count = isMobile ? 35 : 70;
    const pColors = ["#B8A88A", "#5B6B54", "#C36B62", "#D4A828"];

    interface Dot { x: number; y: number; vx: number; vy: number; r: number; color: string; }
    const dots: Dot[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.5 + 1,
      color: pColors[Math.floor(Math.random() * pColors.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      dots.forEach((d, i) => {
        // Repulse from cursor
        const dx = d.x - mouseX;
        const dy = d.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist > 0) {
          const force = (80 - dist) / 80 * 0.8;
          d.vx += (dx / dist) * force;
          d.vy += (dy / dist) * force;
        }
        d.vx *= 0.98;
        d.vy *= 0.98;
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;
        if (d.y > height) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = 0.22;
        ctx.fill();

        // Links
        for (let j = i + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const ldx = d.x - d2.x;
          const ldy = d.y - d2.y;
          const ldist = Math.sqrt(ldx * ldx + ldy * ldy);
          if (ldist < 100) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.strokeStyle = d.color;
            ctx.globalAlpha = 0.06 * (1 - ldist / 100);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [scene, applicant]);

  // 2c. Custom Cursor (desktop only)
  useEffect(() => {
    if (getIsTouch() || getReducedMotion()) return;
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0;
    let rx = 0, ry = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);

    const lerp = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      rafId = requestAnimationFrame(lerp);
    };
    lerp();

    // Hover detection for interactive elements
    const handleOver = () => { dot.classList.add("hovering"); ring.classList.add("hovering"); };
    const handleOut = () => { dot.classList.remove("hovering"); ring.classList.remove("hovering"); };
    const interactables = document.querySelectorAll("button, a, .envelope-wrapper, input");
    interactables.forEach(el => {
      el.addEventListener("mouseenter", handleOver);
      el.addEventListener("mouseleave", handleOut);
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      interactables.forEach(el => {
        el.removeEventListener("mouseenter", handleOver);
        el.removeEventListener("mouseleave", handleOut);
      });
    };
  });

  // 3. Stagger-in text & flip animations for Stitched Paper Cards
  useEffect(() => {
    if (scene !== "letters") return;

    // Slide & slight rotation for the card
    gsap.fromTo(".sf-card", {
      opacity: 0,
      y: 50,
      rotate: activeLetter % 2 === 0 ? -1 : 1
    }, {
      opacity: 1,
      y: 0,
      rotate: activeLetter % 2 === 0 ? -1.5 : 1.5,
      duration: 0.6,
      ease: "power2.out"
    });

    // Stagger each line of text
    gsap.fromTo(".sf-card-line", {
      opacity: 0,
      y: 15
    }, {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.45,
      ease: "power2.out",
      delay: 0.15
    });
  }, [activeLetter, scene]);

  // 4. Envelope Opening Sequence
  const handleOpenEnvelope = () => {
    if (envelopeOpen) return;
    setEnvelopeOpen(true);
    playSFX("pop");

    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => {
          setScene("letters");
        }, 600);
      }
    });

    // Flip flap open
    tl.to(".envelope-flap", {
      rotateX: 180,
      duration: 0.6,
      ease: "power2.inOut"
    });

    // Seal fade out
    tl.to(".envelope-wax-seal", {
      scale: 0.8,
      opacity: 0,
      duration: 0.3
    }, "-=0.3");

    // Paper preview slide out
    tl.to(".envelope-paper-preview", {
      y: -60,
      duration: 0.45,
      ease: "back.out(1.5)"
    });

    // Shrink envelope wrapper
    tl.to(".envelope-wrapper", {
      scale: 0.9,
      opacity: 0,
      duration: 0.4
    });
  };

  // 4b. Envelope dynamic shadow on hover
  const handleEnvelopeHover = useCallback((e: React.MouseEvent) => {
    if (getIsTouch()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    gsap.to(e.currentTarget, {
      boxShadow: `${-x}px ${-y}px 45px rgba(139,126,102,0.25)`,
      duration: 0.2,
    });
  }, []);
  const handleEnvelopeLeave = useCallback((e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      boxShadow: "0 20px 40px rgba(13, 43, 78, 0.12)",
      duration: 0.4,
    });
  }, []);

  // 4c. Magnetic button effect
  const handleMagneticMove = useCallback((e: React.MouseEvent<any>) => {
    if (getIsTouch()) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: "power2.out" });
  }, []);
  const handleMagneticLeave = useCallback((e: React.MouseEvent<any>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  }, []);

  // 4d. Animated underline trigger when letters scene appears
  useEffect(() => {
    if (scene !== "letters" || !headingUnderlineRef.current) return;
    const timer = setTimeout(() => {
      headingUnderlineRef.current?.classList.add("visible");
    }, 600);
    return () => clearTimeout(timer);
  }, [scene, activeLetter]);

  // 5c. Staggered letter animation for applicant name (celebration)
  useEffect(() => {
    if (scene !== "celebration" || !nameRef.current) return;
    if (getReducedMotion()) return;
    const chars = nameRef.current.querySelectorAll(".name-char");
    gsap.fromTo(chars, { opacity: 0, y: 12 }, {
      opacity: 1, y: 0, stagger: 0.04, duration: 0.4, ease: "back.out(2)", delay: 0.3
    });
  }, [scene]);

  // 3D perspective layout style calculations for Results cards (Scenic Envelope)
  const getCardStyle = (index: number) => {
    const diff = index - activeLetter;
    const isMobile = windowWidth < 640;
    const offset = isMobile ? 120 : 230; // Compressed spacing on mobile viewports
    const farOffset = isMobile ? 200 : 360;

    if (diff === 0) {
      return {
        transform: "translateX(0) translateZ(80px) rotateY(0deg) scale(1.02)",
        zIndex: 50,
        opacity: 1,
        pointerEvents: "auto" as const
      };
    } else if (diff === -1) {
      return {
        transform: `translateX(-${offset}px) translateZ(0px) rotateY(25deg) scale(${isMobile ? 0.75 : 0.85}) rotate(-3deg)`,
        zIndex: 30,
        opacity: isMobile ? 0.45 : 0.65,
        pointerEvents: "auto" as const
      };
    } else if (diff === 1) {
      return {
        transform: `translateX(${offset}px) translateZ(0px) rotateY(-25deg) scale(${isMobile ? 0.75 : 0.85}) rotate(3deg)`,
        zIndex: 30,
        opacity: isMobile ? 0.45 : 0.65,
        pointerEvents: "auto" as const
      };
    } else if (diff === -2) {
      return {
        transform: `translateX(-${farOffset}px) translateZ(-40px) rotateY(40deg) scale(${isMobile ? 0.6 : 0.7}) rotate(-6deg)`,
        zIndex: 10,
        opacity: isMobile ? 0 : 0.2,
        pointerEvents: "none" as const
      };
    } else if (diff === 2) {
      return {
        transform: `translateX(${farOffset}px) translateZ(-40px) rotateY(-40deg) scale(${isMobile ? 0.6 : 0.7}) rotate(6deg)`,
        zIndex: 10,
        opacity: isMobile ? 0 : 0.2,
        pointerEvents: "none" as const
      };
    } else {
      return {
        transform: `translateX(${diff > 0 ? farOffset + 100 : -farOffset - 100}px) translateZ(-80px) rotateY(0deg) scale(0.5)`,
        zIndex: 0,
        opacity: 0,
        pointerEvents: "none" as const
      };
    }
  };

  // 3D perspective layout style calculations for Landing Page Departments Carousel
  const getLandingCardStyle = (index: number) => {
    const N = LANDING_DEPARTMENTS.length;
    let diff = index - activeLandingCard;
    // Circular wrap to range [-N/2, N/2] i.e. [-5, 4]
    diff = ((diff + N / 2) % N + N) % N - N / 2;

    const isMobile = windowWidth < 640;
    const offset = isMobile ? 115 : 210;
    const farOffset = isMobile ? 180 : 330;

    if (diff === 0) {
      return {
        transform: "translateX(0) translateZ(80px) rotateY(0deg) scale(1.02)",
        zIndex: 50,
        opacity: 1,
        pointerEvents: "auto" as const
      };
    } else if (diff === -1) {
      return {
        transform: `translateX(-${offset}px) translateZ(0px) rotateY(25deg) scale(${isMobile ? 0.75 : 0.85}) rotate(-3deg)`,
        zIndex: 30,
        opacity: isMobile ? 0.5 : 0.7,
        pointerEvents: "auto" as const
      };
    } else if (diff === 1) {
      return {
        transform: `translateX(${offset}px) translateZ(0px) rotateY(-25deg) scale(${isMobile ? 0.75 : 0.85}) rotate(3deg)`,
        zIndex: 30,
        opacity: isMobile ? 0.5 : 0.7,
        pointerEvents: "auto" as const
      };
    } else if (diff === -2) {
      return {
        transform: `translateX(-${farOffset}px) translateZ(-40px) rotateY(40deg) scale(${isMobile ? 0.6 : 0.7}) rotate(-6deg)`,
        zIndex: 10,
        opacity: isMobile ? 0 : 0.25,
        pointerEvents: "none" as const
      };
    } else if (diff === 2) {
      return {
        transform: `translateX(${farOffset}px) translateZ(-40px) rotateY(-40deg) scale(${isMobile ? 0.6 : 0.7}) rotate(6deg)`,
        zIndex: 10,
        opacity: isMobile ? 0 : 0.25,
        pointerEvents: "none" as const
      };
    } else {
      return {
        transform: `translateX(${diff > 0 ? farOffset + 100 : -farOffset - 100}px) translateZ(-80px) rotateY(0deg) scale(0.5)`,
        zIndex: 0,
        opacity: 0,
        pointerEvents: "none" as const
      };
    }
  };

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

  /* ---- GSAP: Landing animations ---- */
  useEffect(() => {
    if (!containerRef.current || applicant) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".nav-bar", { y: -45, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1,
      });
      gsap.fromTo(".hero-el", { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: "power2.out", delay: 0.2,
      });
      // Floating ambient shapes
      gsap.to(".cloud-a", { y: -12, x: 6, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".cloud-b", { y: 10, x: -7, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1, delay: -2 });
      gsap.to(".cloud-c", { y: -8, x: 5, duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1, delay: -4 });
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

  /* ---- Scroll to NIM Portal ---- */
  const scrollToPortal = () => {
    document.getElementById("check-portal")?.scrollIntoView({ behavior: "smooth" });
  };

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
      const foundDept = departmentsList.find(
        (d) => d.id === found.departemen.toLowerCase() ||
          d.name.toLowerCase() === found.departemen.toLowerCase()
      );
      setApplicant(found);
      setPersonalMessage(foundMsg?.message ?? "");
      setDeptInfo(foundDept ?? null);
      setScene("intro");
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setApplicant(null); setDeptInfo(null); setPersonalMessage("");
    setNim(""); setNotFound(false); setError("");
    setScene("login"); setActiveLetter(0); setEnvelopeOpen(false);
  };

  /* ======================================================
     RENDER
     ====================================================== */
  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col bg-rp-hero overflow-x-hidden cursor-none sm:cursor-none" style={{ cursor: isTouch ? 'auto' : undefined }}>

      {/* ── Grain texture overlay ── */}
      <div className="grain-overlay" />

      {/* ── Vignette (shown during unboxing scenes) ── */}
      {applicant && <div className="vignette" />}

      {/* ── Ambient particle canvas (unboxing scenes) ── */}
      {applicant && <canvas ref={particleCanvasRef} className="pointer-events-none fixed inset-0 z-0 w-full h-full" />}

      {/* ── Custom cursor (desktop only) ── */}
      <div ref={cursorDotRef} className="cursor-dot" />
      <div ref={cursorRingRef} className="cursor-ring" />

      {/* ── Background decoration / Ambient clouds ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="cloud-a absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/40 blur-[90px]" />
        <div className="cloud-b absolute top-[25%] -right-10 w-[350px] h-[350px] rounded-full bg-[#A8D8F0]/25 blur-[100px]" />
        <div className="cloud-c absolute -bottom-10 left-[25%] w-[450px] h-[450px] rounded-full bg-[#C4E2F5]/20 blur-[110px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-[#5CB3E8]/8 blur-[130px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="nav-bar sticky top-0 z-50 w-full nav-glass">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <img
              src="/image/rumpres.png"
              alt="Logo Rumah Prestasi"
              className="w-9 h-9 object-contain shrink-0 filter drop-shadow-sm"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-bold text-[#0D2B4E] tracking-[-0.01em] font-sans">
                Rumah Prestasi
              </span>
              <span className="text-[10px] text-[#4A7BA5] tracking-wide font-sans">
                FPMIPA UPI · Open Recruitment 2026
              </span>
            </div>
          </div>

          {/* Desktop/Tablet Middle Navigation Links (Flowblox inspired) */}
          {/* <nav className="hidden md:flex items-center gap-6">
            {["Tentang", "Departemen", "Galeri", "Hubungi"].map((link) => (
              <span 
                key={link}
                onClick={applicant ? undefined : scrollToPortal}
                className="text-[12px] font-semibold text-[#4A7BA5] hover:text-[#0D2B4E] transition-colors duration-200 cursor-pointer"
              >
                {link}
              </span>
            ))}
          </nav> */}

          <div className="flex items-center gap-2.5">
            {/* Audio Toggle */}
            {/* <button
              onClick={() => setIsMuted(prev => !prev)}
              className="btn-light text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 hover:scale-105 transition-all duration-200 cursor-pointer"
              title={isMuted ? "Aktifkan Suara" : "Matikan Suara"}
            >
              {isMuted ? "🔇 Suara Off" : "🔊 Suara On"}
            </button> */}

            {!applicant ? (
              <button
                onClick={scrollToPortal}
                className="btn-light text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm hover:scale-105 transition-all duration-200"
              >
                Cek NIM
              </button>
            ) : (
              <button onClick={handleLogout} className="btn-light text-xs px-3.5 py-1.5 rounded-lg font-sans">
                Keluar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center w-full max-w-5xl mx-auto px-4 py-8">

        {!applicant ? (
          /* ========== LANDING PAGE VIEW (Flowblox Styled) ========== */
          <div className="w-full flex flex-col items-center py-6 sm:py-10">

            {/* Hero Section */}
            <div className="text-center max-w-3xl mb-12 flex flex-col items-center">
              <div className="hero-el badge-gold mb-5 mx-auto animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A828]" />
                RUMAH PRESTASI
              </div>

              <h1 className="hero-el flow-hero-title mb-5">
                Selamat Datang  <br className="sm:hidden" />
                Orang Orang Hebat di<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C36B62] to-[#B8A88A]">
                  Rumah Prestasi FPMIPA
                </span>
              </h1>

              <p className="hero-el text-xs sm:text-[14px] text-[#4A7BA5] max-w-xl mx-auto leading-relaxed mb-8">
                Tempat untuk kamu membuka lembaran , ukir prestasi terbaik, dan tumbuh bersama keluarga juara.
                <span className="block mt-2 font-bold text-[#B8A88A] text-sm">#JuaranyaFPMIPA</span>
              </p>

              <button
                onClick={scrollToPortal}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className="hero-el flow-pill-btn px-7 py-3 text-xs sm:text-sm shadow-md cursor-pointer"
              >
                Cek Hasil Seleksi Anda
              </button>
            </div>

            {/* 3D curved department cards perspective carousel (Flowblox style team arc) */}
            <div className="hero-el w-full flex flex-col items-center gap-6 py-6 overflow-visible mb-16">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-[#B8A88A] tracking-widest uppercase block">Mari Mengenal</span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0D2B4E]">Departemen Rumah Prestasi FPMIPA</h2>
              </div>

              {/* 3D Curved deck container */}
              <div className="relative w-full h-[320px] sm:h-[350px] flex items-center justify-center perspective-[1200px] overflow-visible mt-4 mb-2">
                {LANDING_DEPARTMENTS.map((dept, idx) => {
                  const cardStyle = getLandingCardStyle(idx);
                  const matchedDept = departmentsList.find(d => d.id === getDeptId(dept.title));
                  const leaders = matchedDept?.leaders || [];
                  return (
                    <div
                      key={idx}
                      style={cardStyle}
                      onClick={() => setActiveLandingCard(idx)}
                      className="absolute w-[240px] sm:w-[270px] h-[280px] sm:h-[310px] transition-all duration-700 ease-out-back cursor-pointer select-none origin-center"
                    >
                      {/* Department card element with Sarah Ferguson stitched details */}
                      <div className="sf-card w-full h-full p-6 sm:p-7 flex flex-col justify-between border border-[#8B7E66]/40 shadow-md relative bg-linen-ivory">
                        <div className="sf-stitched-border" />
                        <div className="sf-paperclip" style={{ right: "32px" }} />

                        {/* Custom decorative felt apple inside the landing cards */}
                        <div
                          style={{ backgroundColor: dept.color }}
                          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-dashed border-white flex items-center justify-center shadow-sm animate-floatGentle"
                        >
                          <div className="w-4 h-4 bg-[#FCFAF2] rounded-full border border-dashed border-[#8B7E66]/30" />
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-[#8B7E66] rounded-sm" />
                        </div>

                        <div className="text-left space-y-3 pt-2">
                          <span
                            style={{ color: dept.color, borderColor: `${dept.color}25`, backgroundColor: `${dept.color}08` }}
                            className="inline-block text-[8px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase"
                          >
                            {dept.badge}
                          </span>
                          <h3 className="text-[16px] sm:text-[18px] font-black text-[#5B6B54] font-serif tracking-tight leading-tight">
                            {dept.title}
                          </h3>
                        </div>

                        {/* Stitched Photo Polaroid Frame inside main card */}
                        {leaders && leaders.length > 0 ? (
                          <div className="my-2 flex justify-center items-center gap-1.5 sm:gap-2.5 overflow-visible">
                            {leaders.map((leader, lIdx) => {
                              const rotation = lIdx === 0 ? "rotate-[-4deg]" : lIdx === 1 ? "rotate-[3deg]" : "rotate-[-2deg]";
                              return (
                                <div
                                  key={lIdx}
                                  className={`relative w-12 h-12 sm:w-15 sm:h-15 ${rotation} shadow-sm border border-[#8B7E66]/30 p-0.5 bg-white rounded-sm transition-all duration-300 hover:scale-110 hover:z-30 hover:rotate-0`}
                                  title={`${leader.name} (${leader.role})`}
                                >
                                  <div className="absolute top-[-5px] left-[30%] w-4 h-2 bg-[#8B7E66]/15 backdrop-blur-[0.5px] border-x border-[#8B7E66]/20 rotate-[10deg] pointer-events-none" />
                                  <img
                                    src={leader.photo}
                                    alt={leader.name}
                                    className="w-full h-full object-cover rounded-sm filter brightness-[1.01]"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          dept.photo && (
                            <div className="my-2.5 flex justify-center overflow-visible">
                              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rotate-[-1.5deg] shadow-sm border border-[#8B7E66]/30 p-1 bg-white rounded-sm transition-transform duration-300 hover:rotate-[1deg] hover:scale-105">
                                <div className="absolute top-[-7px] left-[35%] w-6 h-3 bg-[#8B7E66]/15 backdrop-blur-[0.5px] border-x border-[#8B7E66]/20 rotate-[10deg] shadow-[0_1px_2px_rgba(0,0,0,0.03)] pointer-events-none" />
                                <img
                                  src={dept.photo}
                                  alt={dept.title}
                                  className="w-full h-full object-cover rounded-sm filter brightness-[1.01]"
                                />
                              </div>
                            </div>
                          )
                        )}

                        <div className="text-left">
                          <p className="text-[10px] text-[#4A7BA5] italic font-medium leading-relaxed">
                            "{dept.tagline}"
                          </p>
                          <div className="w-12 h-0.5 bg-[#B8A88A]/30 mt-2.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail drawer representing active card info */}
              <div className="w-full max-w-[500px] text-center px-4 py-2 mt-2">
                <p className="text-xs text-[#5C5549] leading-relaxed italic bg-white/45 backdrop-blur-sm rounded-xl px-5 py-4 border border-[#C2DFF0]/30 shadow-sm font-sans">
                  {LANDING_DEPARTMENTS[activeLandingCard].desc}
                </p>
              </div>

              {/* Navigation dots and arrows */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveLandingCard(prev => (prev - 1 + LANDING_DEPARTMENTS.length) % LANDING_DEPARTMENTS.length)}
                  className="btn-light text-[10px] px-3 py-1 rounded-full cursor-pointer"
                >
                  ←
                </button>
                <div className="flex gap-1.5">
                  {LANDING_DEPARTMENTS.map((_, dot) => (
                    <span
                      key={dot}
                      onClick={() => setActiveLandingCard(dot)}
                      className={`dot w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${activeLandingCard === dot ? "bg-[#5B6B54] w-3" : "bg-[#B8A88A]/40"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setActiveLandingCard(prev => (prev + 1) % LANDING_DEPARTMENTS.length)}
                  className="btn-light text-[10px] px-3 py-1 rounded-full cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>



            {/* NIM Check Dedicated Section (id="check-portal") */}
            <div id="check-portal" className="hero-el w-full max-w-[440px] mt-4">

              {/* Luxury Envelope styled check card */}
              <div className="sf-card w-full p-8 sm:p-9 border border-[#8B7E66]/50 shadow-xl relative overflow-hidden bg-linen-ivory">
                <div className="sf-stitched-border" />
                <div className="sf-paperclip" />

                {/* Gold wax seal at top center */}
                <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-[#ECA628] to-[#B26C08] rounded-full border-2 border-[#F3C46B] shadow-md flex items-center justify-center z-10 animate-floatGentle">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>

                <div className="text-center space-y-3 mb-6 pt-5">
                  <span className="text-[9px] font-bold tracking-widest text-[#B8A88A] uppercase">CEK STATUS RESMI</span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#0D2B4E]">Portal Kelulusan</h3>
                  <p className="text-[11px] text-[#4A7BA5] leading-relaxed max-w-xs mx-auto">
                    Silakan ketik Nomor Induk Mahasiswa (NIM) Anda untuk membuka amplop pengumuman hasil seleksi.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <label htmlFor="nim-input" className="block text-[9px] font-bold text-[#B8A88A] tracking-wider uppercase mb-2 text-left pl-1">
                      Nomor Induk Mahasiswa (NIM)
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
                      className={`w-full rounded-xl px-4 py-3 bg-[#FCFAF2] border ${error || notFound ? "border-red-400 focus:border-red-500" : "border-[#B8A88A]/40 focus:border-[#5B6B54]"
                        } text-[#0D2B4E] font-medium text-center tracking-[0.15em] placeholder:text-[#B8A88A]/50 placeholder:tracking-normal placeholder:text-xs outline-none transition-all duration-200 focus-ring font-sans`}
                    />
                    {error && (
                      <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
                    )}
                    {notFound && (
                      <p className="text-xs text-red-500 mt-2 text-center leading-relaxed">
                        NIM tidak terdaftar. <span className="text-[#4A7BA5] block">Pastikan NIM sudah benar atau hubungi admin.</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !dataReady}
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    className="w-full btn-rp py-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#5B6B54] to-[#8B7E66] border border-[#B8A88A]/20 shimmer-gold cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="spin inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />
                        <span className="animate-pulse">Validasi Data...</span>
                      </span>
                    ) : (
                      "Buka Amplop Pengumuman"
                    )}
                  </button>
                </form>

                <p className="text-[9px] text-[#B8A88A]/70 text-center mt-5 uppercase tracking-wider font-semibold">
                  CONFIDENTIAL • RUMAH PRESTASI 2026
                </p>
              </div>
            </div>

          </div>

        ) : (
          /* ========== RESULT VIEW (Multi-scene Interactive Unboxing) ========== */
          <div ref={resultRef} className="w-full flex flex-col justify-center items-center overflow-visible py-6">

            {/* ── Scene 0: Intro Animation ── */}
            {scene === "intro" && (
              <div className="w-full max-w-[400px] text-center space-y-6 py-20 px-6 animate-pulse">
                <div className="text-[10px] font-black tracking-[0.25em] text-[#B8931F] uppercase font-serif">RUMAH PRESTASI 2026</div>
                <h2 className="text-[#0D2B4E] text-2xl font-black font-serif leading-relaxed">
                  Ada pesan penting <br /> untukmu...
                </h2>
                <div className="text-xl font-bold font-serif text-[#1B5E9E] border-y border-dashed border-[#B8A88A]/40 py-3.5 tracking-wide">
                  ✦ {applicant.nama} ✦
                </div>
              </div>
            )}

            {/* ── Scene 1: Sealed Envelope Unboxing ── */}
            {scene === "envelope" && (
              <div className="w-full max-w-[400px] text-center space-y-6 flex flex-col items-center">
                <div className="space-y-2">
                  <div className="badge-rp mx-auto">RUMAH PRESTASI</div>
                  <h2 className="text-xl font-bold text-[#0D2B4E] font-serif">Amplop Hasil Seleksi</h2>
                  <p className="text-xs text-[#4A7BA5] leading-relaxed">Klik amplop segel di bawah ini untuk membuka pesan kelulusan Anda</p>
                </div>

                <div className="envelope-container py-8">
                  <div
                    onClick={handleOpenEnvelope}
                    onMouseMove={handleEnvelopeHover}
                    onMouseLeave={handleEnvelopeLeave}
                    className={`envelope-wrapper ${envelopeOpen ? "open" : ""}`}
                  >
                    {/* Top Flap */}
                    <div className="envelope-flap" />

                    {/* Wax Seal */}
                    <div className="envelope-wax-seal">
                      <img
                        src="/image/rumpres.png"
                        alt="Segel Rumah Prestasi"
                        className="w-10 h-10 object-contain filter drop-shadow-sm select-none brightness-110"
                      />
                    </div>

                    {/* Paper preview slide out */}
                    <div className="envelope-paper-preview absolute bottom-4 left-4 right-4 h-24 bg-[#FCFAF2] rounded-lg shadow-inner z-2 p-4 flex flex-col justify-center items-center pointer-events-none transform translate-y-0">
                      <span className="text-[9px] font-bold text-[#1B5E9E] tracking-wider uppercase mb-1">SURAT KEPUTUSAN</span>
                      <div className="w-20 h-0.5 bg-[#EDDCC9]" />
                    </div>

                    {/* Front sides overlay */}
                    <div className="envelope-front" />

                    {/* Back side panel */}
                    <div className="envelope-back" />
                  </div>
                </div>

                <p className="text-[10px] font-bold text-[#8AACCC] tracking-wider uppercase animate-bounce mt-4">
                  TAP AMPLOP UNTUK MEMBUKA
                </p>
              </div>
            )}

            {/* ── Scene 2: Flowblox Curved Stitched Card Perspective Deck ── */}
            {scene === "letters" && (
              <div className="w-full max-w-[800px] flex flex-col items-center gap-8 py-8 overflow-visible">

                {/* 3D Arc Card Deck */}
                <div className="relative w-full h-[450px] flex items-center justify-center perspective-[1200px] overflow-visible mb-6">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const cardStyle = getCardStyle(idx);
                    return (
                      <div
                        key={idx}
                        style={cardStyle}
                        onClick={() => { if (idx !== activeLetter) setActiveLetter(idx); }}
                        className="absolute w-[310px] sm:w-[360px] min-h-[400px] transition-all duration-700 ease-out-back cursor-pointer select-none origin-center"
                      >
                        {idx === 0 && (
                          /* Card 0: Selamat Kelulusan */
                          <div className="sf-card w-full p-8 sm:p-9 min-h-[400px] flex flex-col justify-between border border-[#8B7E66]/40 shadow-lg relative h-full bg-linen-ivory">
                            <div className="sf-stitched-border" />
                            <div className="sf-paperclip" />

                            {/* Apple 1 */}
                            <div className="absolute top-6 right-8 w-14 h-14 bg-[#C36B62] rounded-full border border-dashed border-white flex items-center justify-center shadow-md transform rotate-12 z-10 animate-floatGentle">
                              <div className="w-9 h-9 bg-[#FCFAF2] rounded-full border border-dashed border-[#8B7E66]/40 flex items-center justify-center">
                                <span className="text-[5px] text-[#8B7E66] font-bold">● ●</span>
                              </div>
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-[#8B7E66] rounded-sm origin-bottom transform -rotate-12" />
                            </div>

                            {/* Apple 2 */}
                            <div className="absolute top-24 right-5 w-10 h-10 bg-[#C36B62] rounded-full border border-dashed border-white flex items-center justify-center shadow-md transform -rotate-12 z-10 animate-floatGentle-2">
                              <div className="w-6 h-6 bg-[#FCFAF2] rounded-full border border-dashed border-[#8B7E66]/40 flex items-center justify-center">
                                <span className="text-[4px] text-[#8B7E66] font-bold">● ●</span>
                              </div>
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#8B7E66] rounded-sm origin-bottom" />
                            </div>

                            {/* Stitched Star bottom left */}
                            <div className="absolute bottom-8 left-8 sf-stitched-star transform -rotate-12 shadow-sm animate-pulse">
                              <span className="text-white text-[10px] font-bold">✩</span>
                            </div>

                            <div className="space-y-4 pt-2 text-left">
                              <div className="sf-card-line flex items-center gap-1.5 text-[#5B6B54] font-bold text-[9px] tracking-wider uppercase font-serif">
                                <span>Illustration ✩ Graphic Design</span>
                              </div>

                              <div className="space-y-1">
                                <span className="sf-card-line text-[9px] font-bold tracking-widest text-[#B8A88A] uppercase block">KEPUTUSAN RESMI</span>
                                <h1 ref={headingUnderlineRef} className="sf-card-line text-3xl font-semibold text-[#5B6B54] tracking-tight leading-[1.1] font-serif animated-underline">
                                  CONGRATS.
                                </h1>
                              </div>

                              <div className="sf-card-line text-[12px] leading-relaxed text-[#5C5549] space-y-3.5 font-serif">
                                <p>Dengan bangga kami menyampaikan bahwa:</p>
                                <p className="text-sm font-bold text-[#C36B62] border-y border-dashed border-[#B8A88A] py-2 my-1 tracking-wide font-sans text-center bg-[#EDF6FC]/30 rounded-lg gradient-text">
                                  ✦ {applicant.nama} ✦
                                </p>
                                <p>dinyatakan <strong className="text-[#5B6B54] font-black">LOLOS SELEKSI</strong> dan diterima sebagai anggota baru Rumah Prestasi 2026!</p>
                              </div>
                            </div>

                            <div className="sf-card-line flex justify-end text-[9px] font-bold text-[#B8A88A] tracking-wider uppercase relative z-10 font-serif">
                              — PANITIA OPREC 2026
                            </div>
                          </div>
                        )}

                        {idx === 1 && leader1 && (
                          /* Card 1: Sambutan Ketua Departemen / Sekre 1 / Bendahara 1 */
                          <div className="sf-card w-full p-8 sm:p-9 min-h-[400px] flex flex-col justify-between border border-[#8B7E66]/40 shadow-lg relative h-full bg-linen-ivory">
                            <div className="sf-stitched-border" />
                            <div className="sf-paperclip" />

                            {/* Stitched felt apple bottom right */}
                            <div className="absolute bottom-6 right-8 w-11 h-11 bg-[#C36B62] rounded-full border border-dashed border-white flex items-center justify-center shadow-md transform rotate-12 z-10 animate-floatGentle">
                              <div className="w-7 h-7 bg-[#FCFAF2] rounded-full border border-dashed border-[#8B7E66]/40 flex items-center justify-center">
                                <span className="text-[4px] text-[#8B7E66] font-bold">● ●</span>
                              </div>
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-[#8B7E66] rounded-sm origin-bottom" />
                            </div>

                            <div className="space-y-5 text-left">
                              <div className="sf-card-line flex flex-col items-center gap-3 border-b border-[#B8A88A]/30 pb-4 mt-2">
                                {/* Premium Polaroid Frame for Leader 1 */}
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rotate-[-3deg] shadow-md border border-[#8B7E66]/40 p-1 bg-white rounded-sm transition-transform duration-300 hover:rotate-[1deg] hover:scale-105">
                                  <div className="absolute top-[-7px] left-[35%] w-6 h-3 bg-[#8B7E66]/15 backdrop-blur-[1px] border-x border-[#8B7E66]/20 rotate-[10deg] shadow-[0_1px_2px_rgba(0,0,0,0.05)] pointer-events-none" />
                                  <img
                                    src={leader1.photo}
                                    alt={leader1.name}
                                    className="w-full h-full object-cover bg-stone-100 filter brightness-[1.02] contrast-[0.98]"
                                  />
                                </div>
                                <div className="text-center">
                                  <h4 className="text-[13px] sm:text-[14px] font-black text-[#5B6B54] font-serif leading-tight">
                                    {leader1.name}
                                  </h4>
                                  <p className="text-[9px] text-[#B8A88A] font-bold uppercase tracking-widest mt-1">
                                    {leader1.role}
                                  </p>
                                </div>
                              </div>

                              <div className="sf-card-line text-[11px] sm:text-[12px] leading-relaxed text-[#5C5549] font-medium font-serif italic pl-4 border-l-2 border-[#5B6B54] bg-[#EDF6FC]/20 py-2.5 pr-2.5 rounded-r-lg max-h-[160px] overflow-y-auto whitespace-pre-line">
                                &ldquo;{leader1.message || "Selamat bergabung! Mari berkarya dan melangkah bersama demi masa depan gemilang di departemen ini."}&rdquo;
                              </div>
                            </div>

                            <div className="sf-card-line text-[9px] font-bold text-[#B8A88A] tracking-wider uppercase relative z-10 font-serif text-left">
                              — {leader1.role.toUpperCase()}
                            </div>
                          </div>
                        )}

                        {idx === 2 && leader2 && (
                          /* Card 2: Sambutan Wakadep / Kadiv / Sekre 2 / Bendahara 2 */
                          <div className="sf-card w-full p-8 sm:p-9 min-h-[400px] flex flex-col justify-between border border-[#8B7E66]/40 shadow-lg relative h-full bg-linen-ivory">
                            <div className="sf-stitched-border" />
                            <div className="sf-paperclip" />

                            {/* Stitched felt apple bottom right */}
                            <div className="absolute bottom-6 right-8 w-11 h-11 bg-[#C36B62] rounded-full border border-dashed border-white flex items-center justify-center shadow-md transform rotate-[-12deg] z-10 animate-floatGentle-2">
                              <div className="w-7 h-7 bg-[#FCFAF2] rounded-full border border-dashed border-[#8B7E66]/40 flex items-center justify-center">
                                <span className="text-[4px] text-[#8B7E66] font-bold">● ●</span>
                              </div>
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-[#8B7E66] rounded-sm origin-bottom" />
                            </div>

                            <div className="space-y-5 text-left">
                              <div className="sf-card-line flex flex-col items-center gap-3 border-b border-[#B8A88A]/30 pb-4 mt-2">
                                {/* Premium Polaroid Frame for Leader 2 */}
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rotate-[3deg] shadow-md border border-[#8B7E66]/40 p-1 bg-white rounded-sm transition-transform duration-300 hover:rotate-[-1deg] hover:scale-105">
                                  <div className="absolute top-[-7px] left-[35%] w-6 h-3 bg-[#8B7E66]/15 backdrop-blur-[1px] border-x border-[#8B7E66]/20 rotate-[-10deg] shadow-[0_1px_2px_rgba(0,0,0,0.05)] pointer-events-none" />
                                  <img
                                    src={leader2.photo}
                                    alt={leader2.name}
                                    className="w-full h-full object-cover bg-stone-100 filter brightness-[1.02] contrast-[0.98]"
                                  />
                                </div>
                                <div className="text-center">
                                  <h4 className="text-[13px] sm:text-[14px] font-black text-[#5B6B54] font-serif leading-tight">
                                    {leader2.name}
                                  </h4>
                                  <p className="text-[9px] text-[#B8A88A] font-bold uppercase tracking-widest mt-1">
                                    {leader2.role}
                                  </p>
                                </div>
                              </div>

                              <div className="sf-card-line text-[11px] sm:text-[12px] leading-relaxed text-[#5C5549] font-medium font-serif italic pl-4 border-l-2 border-[#5B6B54] bg-[#EDF6FC]/20 py-2.5 pr-2.5 rounded-r-lg max-h-[160px] overflow-y-auto whitespace-pre-line">
                                &ldquo;{leader2.message || "Selamat bergabung! Mari berkarya dan melangkah bersama demi masa depan gemilang di departemen ini."}&rdquo;
                              </div>
                            </div>

                            <div className="sf-card-line text-[9px] font-bold text-[#B8A88A] tracking-wider uppercase relative z-10 font-serif text-left">
                              — {leader2.role.toUpperCase()}
                            </div>
                          </div>
                        )}

                        {idx === 3 && (
                          /* Card 3: Pesan Ketua Umum BEM */
                          <div className="sf-card w-full p-8 sm:p-9 min-h-[400px] flex flex-col justify-between border border-[#8B7E66]/40 shadow-lg relative h-full bg-linen-ivory">
                            <div className="sf-stitched-border" />
                            <div className="sf-paperclip" />

                            {/* Stitched Star top right */}
                            <div className="absolute top-6 right-8 sf-stitched-star transform rotate-12 shadow-sm animate-pulse bg-amber-500 border-amber-300 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            </div>

                            <div className="space-y-5 text-left">
                              <div className="sf-card-line flex flex-col items-center gap-3 border-b border-[#B8A88A]/30 pb-4 mt-2">
                                {/* Premium Stitched Photo Polaroid Frame for President */}
                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rotate-[1.5deg] shadow-md border border-[#8B7E66]/40 p-1.5 bg-white rounded-sm transition-transform duration-300 hover:rotate-[-1deg] hover:scale-105">
                                  <div className="absolute top-[-10px] left-[35%] w-8 h-4 bg-[#8B7E66]/15 backdrop-blur-[1px] border-x border-[#8B7E66]/20 rotate-[-8deg] shadow-[0_1px_2px_rgba(0,0,0,0.05)] pointer-events-none" />
                                  <img
                                    src="/image/ketua_rumah_prestasi.jpg"
                                    alt="Ahmad Izzuddin Azzam"
                                    className="w-full h-full object-cover bg-stone-100 filter brightness-[1.02] contrast-[0.98]"
                                  />
                                </div>
                                <div className="text-center">
                                  <h4 className="text-[14px] sm:text-[15px] font-black text-[#5B6B54] font-serif leading-tight">Ahmad Izzuddin Azzam</h4>
                                  <p className="text-[9px] text-[#B8A88A] font-bold uppercase tracking-widest mt-1">Ketua Umum Rumah Prestasi</p>
                                </div>
                              </div>

                              <div className="sf-card-line text-[12px] leading-relaxed text-[#5C5549] font-medium font-serif italic pl-4 border-l-2 border-[#D4A828] bg-[#FFFBEB]/45 py-2.5 pr-2.5 rounded-r-lg">
                                {personalMessage ? (
                                  <span>&ldquo;{personalMessage}&rdquo;</span>
                                ) : (
                                  <span>&ldquo;Selamat bergabung di keluarga besar Rumah Prestasi! Ini adalah langkah awal perjuangan barumu. Jadikan setiap tantangan sebagai tempat berproses terbaikmu. Aku menunggumu di pelantikan nanti!&rdquo;</span>
                                )}
                              </div>
                            </div>

                            <div className="sf-card-line text-[9px] font-bold text-[#B8A88A] tracking-wider uppercase relative z-10 font-serif text-left">
                              — KETUA UMUM RUMAH PRESTASI FPMIPA
                            </div>
                          </div>
                        )}

                        {idx === 4 && (
                          /* Card 4: Langkah Selanjutnya (Next Steps) */
                          <div className="sf-card w-full p-8 sm:p-9 min-h-[400px] flex flex-col justify-between border border-[#8B7E66]/40 shadow-lg relative h-full bg-linen-ivory">
                            <div className="sf-stitched-border" />
                            <div className="sf-paperclip" />

                            <div className="space-y-4 text-left">
                              <div className="space-y-1 pb-3 border-b border-[#B8A88A]/30 mt-2">
                                <span className="sf-card-line text-[9px] font-bold text-[#B8A88A] tracking-widest uppercase block">MEMO RESMI</span>
                                <h3 className="sf-card-line text-lg font-black text-[#5B6B54] font-serif flex items-center gap-1.5">
                                  Langkah Selanjutnya
                                </h3>
                              </div>

                              <div className="space-y-3 sf-card-line pt-2">
                                {[
                                  "Simpan bukti kelulusan ini",
                                  "Gabung grup koordinasi staf resmi",
                                  "Hadir di acara Inaugurasi: 1 Juni 2026",
                                  "Dresscode: Pakaian Formal Hitam",
                                ].map((step, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border border-dashed border-[#5B6B54] flex items-center justify-center text-[10px] text-[#5B6B54] font-extrabold shrink-0 bg-[#EDF6FC]">
                                      ✓
                                    </div>
                                    <span className="text-[11px] font-semibold text-[#5C5549]">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="sf-card-line relative z-10 pt-4 flex flex-col items-center">
                              <button
                                onClick={() => setScene("celebration")}
                                onMouseMove={handleMagneticMove}
                                onMouseLeave={handleMagneticLeave}
                                className="w-full btn-rp py-3.5 rounded-xl text-sm bg-gradient-to-r from-[#5B6B54] to-[#8B7E66] border border-[#B8A88A]/20 shimmer-gold cursor-pointer"
                              >
                                Rayakan Kelulusanmu!
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Progress dot indicators & navigation controls */}
                <div className="flex justify-between items-center w-full max-w-[480px] px-4 py-1 z-10 font-sans">
                  <button
                    disabled={activeLetter === 0}
                    onClick={() => { setActiveLetter(prev => prev - 1); playSFX("whoosh"); }}
                    className="btn-light text-[11px] px-3.5 py-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  >
                    ← Kembali
                  </button>
                  <div className="progress flex justify-center gap-1.5 shrink-0 mx-2">
                    {[0, 1, 2, 3, 4].map(dot => (
                      <span
                        key={dot}
                        onClick={() => { setActiveLetter(dot); playSFX("whoosh"); }}
                        className={`dot w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${activeLetter === dot ? "bg-[#5B6B54] scale-125 px-2" : "bg-[#B8A88A]/40"}`}
                      />
                    ))}
                  </div>
                  <button
                    disabled={activeLetter === 4}
                    onClick={() => { setActiveLetter(prev => prev + 1); playSFX("whoosh"); }}
                    className="btn-light text-[11px] px-3.5 py-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  >
                    Lanjut →
                  </button>
                </div>
              </div>
            )}

            {/* ── Scene 3: Canvas Confetti Ending Celebration ── */}
            {scene === "celebration" && (
              <div
                onClick={handlePageClick}
                className="w-full max-w-[420px] text-center space-y-6 relative z-10 py-4 flex flex-col items-center select-none"
              >

                {/* Overlay canvas */}
                <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50 w-full h-full" />
                <div className="badge-rp bg-[#C36B62]/10 text-[#C36B62] border-[#C36B62]/20 mx-auto font-sans">
                  Selamat Bergabung!
                </div>

                {/* Sparkle container */}
                <div ref={sparkleContainerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />

                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-none font-serif welcome-title">
                  WELCOME
                </h1>

                <p ref={nameRef} className="text-xs sm:text-sm text-[#5C5549] font-medium max-w-xs mx-auto leading-relaxed font-serif">
                  Kamu resmi bergabung di keluarga besar <br />
                  <strong className="text-[#C36B62]">
                    {(deptInfo?.fullName ?? applicant.departemen).split("").map((ch, i) => (
                      <span key={i} className="name-char inline-block opacity-0">{ch === " " ? "\u00A0" : ch}</span>
                    ))}
                  </strong> <br />
                  Rumah Prestasi 2026 <br />
                  <span className="text-[11px] font-extrabold text-[#5B6B54] tracking-wider block mt-2 font-sans">#JuaranyaFPMIPA</span>
                </p>

                {/* Final data receipt with Sarah Ferguson Stitches */}
                <div className="sf-card p-6 text-left border border-[#E8D48B]/50 shadow-md w-full relative bg-linen-ivory">
                  <div className="sf-stitched-border" />
                  <h4 className="text-[10px] font-black text-[#B8A88A] tracking-widest uppercase mb-3.5 text-center border-b pb-2 font-sans">DATA PENGURUS BARU</h4>
                  <div className="space-y-2.5 font-sans">
                    <div className="flex justify-between text-xs py-1 border-b border-[#EDF6FC]/50">
                      <span className="font-bold text-[#8AACCC]">NAMA LENGKAP:</span>
                      <span className="font-bold text-[#0D2B4E]">{applicant.nama}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-[#EDF6FC]/50">
                      <span className="font-bold text-[#8AACCC]">NIM:</span>
                      <span className="font-bold text-[#2D4A6A]">{applicant.nim}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-[#EDF6FC]/50">
                      <span className="font-bold text-[#8AACCC]">DEPARTEMEN:</span>
                      <span className="font-bold text-[#1B5E9E]">{applicant.departemen}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="font-bold text-[#8AACCC]">JABATAN:</span>
                      <span className="font-bold text-[#B8931F]">{applicant.jabatan}</span>
                    </div>
                  </div>
                </div>


                <div className="pt-4 flex flex-col gap-2.5 w-full font-sans">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    className="btn-rp py-3.5 text-sm w-full shadow-lg bg-gradient-to-r from-[#5B6B54] to-[#8B7E66] border border-[#B8A88A]/20 cursor-pointer"
                  >
                    Selesai & Keluar
                  </button>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    className="w-full btn-light py-3 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-[#128C7E]/40 text-[#128C7E] hover:bg-[#128C7E]/5 transition-colors transition-all cursor-pointer"
                  >
                    💬 Chat Kadep Kamu ({deptInfo?.kadepName ?? "LO"})
                  </a>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full py-8 px-5 border-t border-[#C2DFF0]/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex justify-center gap-3 font-sans">
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
          <div className="text-center space-y-0.5 font-sans mt-4">
            <p className="text-[11px] text-[#4A7BA5]">© 2026 Rumah Prestasi FPMIPA UPI</p>
            <p className="text-[10px] text-[#8AACCC]">Universitas Pendidikan Indonesia · Bandung</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
