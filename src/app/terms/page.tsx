import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan - Tata Warga",
  description: "Syarat dan ketentuan penggunaan layanan Tata Warga.",
};

export default async function TermsAndConditionsPage() {
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
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Syarat & Ketentuan</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Pendahuluan</h2>
              <p className="leading-relaxed text-muted-foreground">
                Syarat dan Ketentuan ini ("Syarat") mengatur akses dan penggunaan Anda terhadap platform web, Dashboard, serta layanan Bot Asisten WhatsApp yang disediakan oleh Tata Warga ("Kami", "Platform", atau "Layanan"). Dengan mendaftar, mengakses, atau menggunakan layanan Tata Warga, Anda menyetujui untuk tunduk dan terikat oleh Syarat ini. Jika Anda tidak menyetujui sebagian atau seluruh Syarat ini, Anda tidak diperkenankan menggunakan Layanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Definisi Pengguna</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Tata Warga:</strong> Platform digitalisasi administrasi RT yang menyediakan Dashboard admin dan Asisten WhatsApp.</li>
                <li><strong>Pengurus/Admin:</strong> Ketua RT, Sekretaris, Bendahara, atau staf yang ditunjuk untuk mendaftarkan akun dan mengelola data di Dashboard.</li>
                <li><strong>Warga:</strong> Penduduk lingkungan yang datanya dicatat oleh Pengurus ke dalam sistem Tata Warga.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Kewajiban & Tanggung Jawab Pengurus</h2>
              <p className="leading-relaxed text-muted-foreground mb-4">
                Sebagai Pengurus atau Admin yang memegang kendali atas Dashboard Tata Warga, Anda bertanggung jawab penuh atas:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Keabsahan Data:</strong> Menjamin bahwa semua data kependudukan, keuangan, dan surat yang diinput ke dalam sistem adalah benar, akurat, dan dapat dipertanggungjawabkan di mata hukum.</li>
                <li><strong>Kerahasiaan Akun:</strong> Menjaga keamanan kredensial <em>login</em> Anda. Tata Warga tidak bertanggung jawab atas kebocoran data warga yang disebabkan oleh kelalaian Pengurus dalam membagikan akses akun kepada pihak yang tidak berwenang.</li>
                <li><strong>Persetujuan Warga:</strong> Memastikan bahwa pencatatan data penduduk ke sistem digital telah mendapat izin atau sesuai dengan peraturan lingkungan yang disepakati oleh warga setempat.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Batasan Tanggung Jawab Layanan</h2>
              <p className="leading-relaxed text-muted-foreground">
                Tata Warga murni bertindak sebagai <strong>Penyedia Perangkat Lunak (Software as a Service)</strong>. Kami tidak bertanggung jawab secara hukum atas:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Perselisihan internal antara Pengurus RT dengan Warga.</li>
                <li>Penyalahgunaan dana kas RT. Transparansi angka di platform bergantung sepenuhnya pada kejujuran input Pengurus.</li>
                <li>Validitas Surat Pengantar yang dibuat melalui platform. Pengurus bertanggung jawab memastikan surat dicetak, ditandatangani, dan disahkan sesuai prosedur (kecuali jika Tanda Tangan Digital lokal diberlakukan secara resmi di wilayah Anda).</li>
                <li>Gangguan layanan sesaat akibat <em>maintenance</em> server atau putusnya koneksi dari pihak API WhatsApp (Meta).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Kebijakan Berlangganan & Pembayaran</h2>
              <p className="leading-relaxed text-muted-foreground">
                Beberapa fitur premium Tata Warga mungkin mengharuskan pembayaran biaya berlangganan. Detail harga, durasi berlangganan, dan fasilitas akan diuraikan dengan jelas pada saat pendaftaran. Semua pembayaran yang telah diverifikasi bersifat <em>non-refundable</em> (tidak dapat dikembalikan), kecuali terjadi kendala sistem fatal dari pihak Tata Warga yang mengakibatkan layanan tidak dapat diakses sama sekali selama lebih dari 14 hari kerja.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Pemutusan Akses</h2>
              <p className="leading-relaxed text-muted-foreground">
                Tata Warga berhak, atas kebijakan kami sendiri, untuk memblokir, menangguhkan, atau menghapus akun Anda tanpa pemberitahuan sebelumnya jika kami menemukan indikasi penipuan, penyalahgunaan sistem (seperti <em>spamming</em> via bot WA), atau pelanggaran hukum pidana/perdata Republik Indonesia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Perubahan Syarat & Ketentuan</h2>
              <p className="leading-relaxed text-muted-foreground">
                Kami dapat memperbarui Syarat & Ketentuan ini sewaktu-waktu tanpa pemberitahuan individual secara langsung. Revisi akan segera berlaku setelah dipublikasikan di halaman ini. Kami menyarankan Anda untuk meninjau halaman ini secara berkala. Melanjutkan penggunaan layanan berarti Anda menyetujui Syarat yang telah diperbarui.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Kontak Kami</h2>
              <p className="leading-relaxed text-muted-foreground">
                Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, Anda dapat menghubungi kami melalui email di <a href="mailto:info@tatawarga.net" className="text-primary hover:underline">info@tatawarga.net</a> atau melalui WhatsApp di <a href="https://api.whatsapp.com/send?phone=6285945441445" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">+62 859 4544 1445</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
      </main>

      <Footer footerText={settings?.footerText} logoUrl={settings?.logoUrl} logoUrlDark={settings?.logoUrlDark} />
    </div>
  );
}
