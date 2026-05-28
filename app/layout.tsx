import type { Metadata } from "next";
import { Inter, Dancing_Script, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rumah Prestasi FPMIPA UPI — Open Recruitment 2026",
  description:
    "Portal resmi pengumuman hasil seleksi Open Recruitment Rumah Prestasi FPMIPA Universitas Pendidikan Indonesia. Masukkan NIM untuk melihat status penerimaan.",
  keywords: ["Rumah Prestasi", "FPMIPA", "UPI", "Open Recruitment", "2026", "BEM", "TumbuhAsa"],
  authors: [{ name: "Rumah Prestasi FPMIPA UPI" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${dancingScript.variable} ${fraunces.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
