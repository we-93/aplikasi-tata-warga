"use client";

import { AnimatedDataWarga } from "@/components/animated-data-warga";
import { AnimatedKasRt } from "@/components/animated-kas-rt";
import { AnimatedNotulenAi } from "@/components/animated-notulen-ai";
import { AnimatedSurat } from "@/components/animated-surat";

export function SolutionSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto space-y-24 md:space-y-32">
        
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
            Solusi Tata Warga
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Integrasi Administrasi & AI</h2>
          <p className="text-lg text-muted-foreground">
            Menggabungkan administrasi konvensional dengan kecerdasan buatan dalam satu ekosistem yang solid.
          </p>
        </div>

        {/* Feature 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              MANAJEMEN DATA
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Database Warga yang Terpusat & Aman</h2>
            <p className="text-lg text-muted-foreground">
              Tinggalkan pencatatan manual di buku besar. Tata Warga mengelola dari profil, NIK, hingga status warga secara terstruktur dan terenkripsi.
            </p>
            <ul className="space-y-3 pt-4">
              {["Pencarian data cepat & efisien", "Filter berdasarkan Jenis Kelamin/Status", "Ekspor file Excel"].map((item, i) => (
                <li key={i} className="flex items-center text-foreground">
                  <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 font-bold">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full -z-10 transform translate-x-10 translate-y-10"></div>
            <AnimatedDataWarga />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              TRANSPARANSI KEUANGAN
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Pembukuan Kas RT Jadi Lebih Praktis</h2>
            <p className="text-lg text-muted-foreground">
              Tinggalkan rekapitulasi buku manual. Buat laporan kas hanya dalam hitungan menit dan laporkan ke warga dengan jauh lebih transparan.
            </p>
            <ul className="space-y-3 pt-4">
              {["Grafik neraca saldo bulanan otomatis", "Pencatatan bebas rumus rumit", "Laporan siap cetak & bagikan ke grup warga"].map((item, i) => (
                <li key={i} className="flex items-center text-foreground">
                  <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 font-bold">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full -z-10 transform -translate-x-10 translate-y-10"></div>
            <AnimatedKasRt />
          </div>
        </div>

        {/* Feature 3: Notulen AI */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              KECERDASAN BUATAN (AI)
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Asisten AI untuk Administrasi RT</h2>
            <p className="text-lg text-muted-foreground">
              Chat AI dengan pendekatan Knowledge Base berbasis RAG untuk menjawab pertanyaan seputar regulasi. AI juga membantu membuat pengumuman, notulen, dan rekap kegiatan secara otomatis.
            </p>
            <ul className="space-y-3 pt-4">
              {["Chat AI berbasis Knowledge Base regulasi", "Pembuatan Notulen Rapat AI", "Pembuatan Pengumuman otomatis"].map((item, i) => (
                <li key={i} className="flex items-center text-foreground">
                  <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 font-bold">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full -z-10 transform translate-x-10 translate-y-10"></div>
            <AnimatedNotulenAi />
          </div>
        </div>

        {/* Feature 4 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              PELAYANAN SURAT & ARSIP
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Pembuatan Surat Ekstra Cepat & Arsip Digital</h2>
            <p className="text-lg text-muted-foreground">
              Proses administrasi surat pengantar yang dulunya memakan waktu berpuluh-puluh menit, kini hanya butuh beberapa menit. Semua arsip tersimpan aman secara digital.
            </p>
            <ul className="space-y-3 pt-4">
              {["Buat surat otomatis dalam hitungan menit", "Tanda tangan elektronik terintegrasi", "Arsip digital aman tanpa tumpukan kertas"].map((item, i) => (
                <li key={i} className="flex items-center text-foreground">
                  <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 font-bold">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full -z-10 transform translate-x-10 -translate-y-10"></div>
            <AnimatedSurat />
          </div>
        </div>

      </div>
    </section>
  );
}
