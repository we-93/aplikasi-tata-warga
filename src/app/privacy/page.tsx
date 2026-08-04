import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

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
            Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Pendahuluan</h2>
              <p className="leading-relaxed text-muted-foreground">
                Selamat datang di Tata Warga. Kami menghargai privasi Anda dan berkomitmen penuh untuk melindungi data pribadi Anda serta data warga di lingkungan Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi saat Anda menggunakan aplikasi berbasis web dan layanan WhatsApp AI Assistant kami.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Informasi yang Kami Kumpulkan</h2>
              <p className="leading-relaxed text-muted-foreground mb-4">
                Saat menggunakan layanan Tata Warga, kami dapat mengumpulkan jenis informasi berikut:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Informasi Pengurus (Admin):</strong> Nama, nomor WhatsApp, email, dan kata sandi untuk keperluan pembuatan akun dan autentikasi.</li>
                <li><strong>Data Warga:</strong> Data kependudukan yang Anda (sebagai pengurus) masukkan ke dalam sistem kami, termasuk namun tidak terbatas pada nama warga, NIK, alamat, status keluarga, dan kontak.</li>
                <li><strong>Data Keuangan (Kas RT):</strong> Catatan transaksi pemasukan dan pengeluaran lingkungan yang dicatat dalam sistem.</li>
                <li><strong>Log Komunikasi WhatsApp:</strong> Pesan yang dikirim ke Bot Asisten WhatsApp Tata Warga oleh jajaran pengurus untuk tujuan mengeksekusi perintah (seperti pembuatan surat atau pencatatan kas).</li>
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
                <li>Mengoperasikan Asisten AI WhatsApp untuk mempercepat interaksi pengurus.</li>
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
                Untuk fitur berbasis Kecerdasan Buatan (AI) seperti pembuatan notulen rapat, data mentah yang Anda proses akan dienkripsi dan diproses secara aman. Kami memastikan penyedia layanan AI kami (seperti OpenAI) mematuhi kebijakan perlindungan data di mana data Anda tidak digunakan untuk melatih model bahasa publik mereka.
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
                <p className="text-foreground font-medium">Email: <a href="mailto:info@tatawarga.net" className="text-primary hover:underline">info@tatawarga.net</a></p>
                <p className="text-foreground font-medium mt-2">WhatsApp: <a href="https://api.whatsapp.com/send?phone=6285945441445" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">+62 859 4544 1445</a></p>
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
