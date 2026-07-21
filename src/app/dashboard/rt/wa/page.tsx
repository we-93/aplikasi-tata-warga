import { MessageCircle, Smartphone } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export default async function WaAsistenPage() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  if (!tenantId) return <div>Akses Ditolak</div>;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { waDevice: true }
  });

  const waNumber = tenant?.whatsappBotNo || "Belum diatur";
  const status = tenant?.waDevice?.status || "OFFLINE";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">WhatsApp Asisten</h1>
        <p className="text-muted-foreground mt-2">Pusat informasi dan panduan penggunaan bot WhatsApp Tata Warga.</p>
      </div>

      {/* Status Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{waNumber}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-sm text-muted-foreground font-medium">{status === 'ONLINE' ? 'Terhubung & Aktif' : 'Terputus (Offline)'}</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 w-full md:w-auto text-sm text-muted-foreground">
          Pengaturan koneksi API dikelola oleh Admin.
        </div>
      </div>

      {/* Commands List */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" /> Panduan Perintah WhatsApp
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Kirimkan perintah utama, ketik <code className="font-bold text-primary">#MENU</code> ke Grup WhatsApp Asisten di atas untuk memulai interaksi. Berikut adalah rincian layanan otomatis yang tersedia:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Menu Warga */}
          <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">#WARGA</span>
            </h4>
            <p className="text-xs text-muted-foreground mb-3">Kelola data kependudukan langsung dari grup WA. Tersedia sub-menu:</p>
            <ul className="text-sm space-y-1 text-slate-600 dark:text-white/70">
              <li>1. Tambah Warga (Isi form otomatis)</li>
              <li>2. Cari Warga (Berdasarkan NIK)</li>
              <li>3. Edit Warga</li>
              <li>4. Hapus Warga</li>
            </ul>
          </div>

          {/* Menu Surat */}
          <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs">#SURAT</span>
            </h4>
            <p className="text-xs text-muted-foreground mb-3">Pembuatan otomatis dokumen format PDF. Tersedia sub-menu:</p>
            <ul className="text-sm space-y-1 text-slate-600 dark:text-white/70">
              <li>• Pilih Jenis Surat</li>
              <li>• Masukkan NIK (Auto-fill data warga)</li>
              <li>• Generate link unduhan PDF</li>
            </ul>
          </div>

          {/* Menu Kas RT */}
          <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
              <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-xs">#KAS RT</span>
            </h4>
            <p className="text-xs text-muted-foreground mb-3">Pencatatan mutasi dan informasi keuangan. Tersedia sub-menu:</p>
            <ul className="text-sm space-y-1 text-slate-600 dark:text-white/70">
              <li>1. Input Pemasukan</li>
              <li>2. Input Pengeluaran</li>
              <li>3. Cek Saldo Terkini</li>
              <li>4. Cetak Laporan Kas</li>
            </ul>
          </div>

          {/* Menu AI */}
          <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
              <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-xs">#AKTIFKAN AI</span>
            </h4>
            <p className="text-xs text-muted-foreground mb-3">Tanya jawab pintar dengan Asisten AI berbasis data RT Anda.</p>
            <ul className="text-sm space-y-1 text-slate-600 dark:text-white/70">
              <li>• Menjawab otomatis selama 10 menit</li>
              <li>• Mampu merangkum laporan kas & warga</li>
              <li>• Ketik <code className="font-bold">#SELESAI</code> untuk mengakhiri sesi AI</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
