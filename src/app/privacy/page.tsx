import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Tata Warga",
  description: "Kebijakan privasi dan perlindungan data pengguna Tata Warga.",
};

export default async function PrivacyPolicyPage() {
  const settings = await prisma.siteSettings.findFirst({
    where: { tenant_id: null }
  });
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar logoUrl={settings?.logoUrl} logoUrlDark={settings?.logoUrlDark} session={session} />
      
      <main className="flex-1 py-12 md:py-24">
      <div className="container max-w-4xl mx-auto px-4 md:px-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Link>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Kebijakan Privasi</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Pembaruan Terakhir: 18 April 2026
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Pendahuluan</h2>
              <p className="leading-relaxed text-muted-foreground">
                Selamat datang di Tata Warga. Kami menghargai privasi Anda dan berkomitmen penuh untuk melindungi data pribadi Anda serta data warga di lingkungan Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi saat Anda menggunakan aplikasi berbasis web, Android, dan layanan AI Assistant berbasis Knowledge Base (RAG) kami.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Informasi yang Kami Kumpulkan</h2>
              <p className="leading-relaxed text-muted-foreground mb-4">
                Saat menggunakan layanan Tata Warga, kami dapat mengumpulkan jenis informasi berikut:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Informasi Pengurus (Admin):</strong> Nama, email, dan kata sandi untuk keperluan pembuatan akun dan autentikasi.</li>
                <li><strong>Data Warga:</strong> Kami tidak mengumpulkan rincian data warga secara spesifik seperti NIK, Nomor KK, atau tanggal lahir secara terpusat. Data warga yang dikelola melalui platform ini murni hanya bersifat umum untuk keperluan statistik dan pemetaan demografi dasar lingkungan RT Anda.</li>
                <li><strong>Data Keuangan (Kas RT):</strong> Catatan transaksi pemasukan dan pengeluaran lingkungan yang dicatat dalam sistem secara mandiri oleh pengurus.</li>
                <li><strong>Data AI Assistant:</strong> Riwayat pencarian dan pertanyaan yang diajukan kepada Chat AI berbasis Knowledge Base RAG murni digunakan untuk membantu Anda memahami regulasi, dan tidak disebarluaskan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Bagaimana Kami Menggunakan Informasi Anda</h2>
              <p className="leading-relaxed text-muted-foreground mb-4">
                Data yang dikumpulkan digunakan murni untuk menyediakan dan meningkatkan layanan administrasi lingkungan, di antaranya:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Memfasilitasi pembuatan surat pengantar dan dokumen administratif lainnya secara otomatis.</li>
                <li>Menghasilkan laporan keuangan kas RT/RW secara transparan.</li>
                <li>Mengoperasikan Asisten AI untuk membantu penyusunan notulen, pengumuman, dan pencarian dokumen publik.</li>
                <li>Mencegah akses yang tidak sah dan meningkatkan keamanan platform kami.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Keamanan Data</h2>
              <p className="leading-relaxed text-muted-foreground">
                Keamanan data lingkungan Anda adalah prioritas utama kami. Kami menerapkan standar keamanan industri terkini, termasuk enkripsi data saat transit dan saat istirahat (<em>in-transit and at-rest encryption</em>), untuk melindungi informasi Anda dari akses, perubahan, pengungkapan, atau penghancuran yang tidak sah. Akses terhadap data warga sepenuhnya dikendalikan oleh hierarki izin pengurus yang bersangkutan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Berbagi Informasi</h2>
              <p className="leading-relaxed text-muted-foreground">
                Kami <strong>tidak akan pernah</strong> menjual, menyewakan, atau menukar data kependudukan maupun data pribadi pengguna kepada pihak ketiga mana pun untuk tujuan pemasaran. Kami hanya membagikan informasi jika diwajibkan oleh hukum yang berlaku atau instruksi pengadilan resmi di yurisdiksi Republik Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Integrasi AI Pihak Ketiga</h2>
              <p className="leading-relaxed text-muted-foreground">
                Untuk fitur berbasis Kecerdasan Buatan (AI), kami menggunakan arsitektur Retrieval-Augmented Generation (RAG) berbasis Knowledge Base mandiri. Kami memastikan penyedia layanan AI kami (seperti OpenAI atau model lokal) mematuhi kebijakan perlindungan data yang ketat di mana kueri Anda tidak digunakan untuk melatih model bahasa publik mereka. Data yang disuplai ke AI difokuskan pada dokumen publik dan regulasi resmi pemerintahan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Hak Pengguna</h2>
              <p className="leading-relaxed text-muted-foreground">
                Sebagai Ketua RT/RW atau administrator terdaftar, Anda memegang kendali penuh atas data lingkungan Anda. Anda berhak untuk mengakses, memperbaiki, mengekspor, atau menghapus data warga dan riwayat kas secara permanen kapan saja melalui <em>Dashboard</em> Tata Warga.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Hubungi Kami</h2>
              <p className="leading-relaxed text-muted-foreground">
                Jika Anda memiliki pertanyaan, keluhan, atau saran mengenai Kebijakan Privasi ini, jangan ragu untuk menghubungi tim dukungan kami melalui:
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border inline-block">
                <p className="text-foreground font-medium">Email: <a href="mailto:info@tatawarga.web.id" className="text-primary hover:underline">info@tatawarga.web.id</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
      </main>

      <Footer footerText={settings?.footerText} logoUrl={settings?.logoUrl} logoUrlDark={settings?.logoUrlDark} />
    </div>
  );
}
