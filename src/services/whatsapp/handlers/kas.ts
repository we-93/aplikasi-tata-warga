import prisma from '@/lib/prisma';
import { sendMessage } from '@/lib/whatsapp';
import { Decimal } from '@prisma/client/runtime/library';

export const handleKasState = async (
  session: any,
  message: string,
  apiKey: string,
  target: string
) => {
  const text = message.trim();
  const { id, state, tenantId } = session;

  if (state === 'MENU_KAS') {
    if (text === '1') {
      await prisma.waSession.update({
        where: { id },
        data: { state: 'KAS_INPUT_PEMASUKAN' },
      });
      await sendMessage(
        apiKey,
        target,
        `📥 *Form Pemasukan*\n\nSilakan balas dengan format:\nNOMINAL, KATEGORI, KETERANGAN (Opsional)\n\nContoh:\n50000, Iuran Bulanan, Pembayaran iuran bulan Juli`
      );
    } else if (text === '2') {
      await prisma.waSession.update({
        where: { id },
        data: { state: 'KAS_INPUT_PENGELUARAN' },
      });
      await sendMessage(
        apiKey,
        target,
        `📤 *Form Pengeluaran*\n\nSilakan balas dengan format:\nNOMINAL, KATEGORI, KETERANGAN (Opsional)\n\nContoh:\n150000, Perbaikan, Beli lampu jalan`
      );
    } else if (text === '3') {
      // Hitung Saldo Bulan Ini
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const kas = await prisma.kasTransaction.findMany({ 
        where: { 
          tenantId,
          date: {
            gte: startOfMonth
          }
        } 
      });
      const totalPemasukan = kas.filter(k => k.type === 'PEMASUKAN').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const totalPengeluaran = kas.filter(k => k.type === 'PENGELUARAN').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const saldo = totalPemasukan - totalPengeluaran;

      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const currentMonthName = monthNames[now.getMonth()];

      await sendMessage(
        apiKey,
        target,
        `💼 *Informasi Saldo Kas RT Bulan ${currentMonthName} ${now.getFullYear()}*\n\nTotal Pemasukan: Rp ${totalPemasukan.toLocaleString('id-ID')}\nTotal Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}\n\n*Saldo Saat Ini: Rp ${saldo.toLocaleString('id-ID')}*`
      );
      await prisma.waSession.update({ where: { id }, data: { state: 'IDLE' } });
    } else if (text === '4') {
      await sendMessage(apiKey, target, `📊 *Laporan Kas*\nLaporan Kas selengkapnya bisa diunduh melalui Dashboard RT.`);
      await prisma.waSession.update({ where: { id }, data: { state: 'IDLE' } });
    } else {
      await sendMessage(apiKey, target, `Pilihan tidak valid. Silakan gunakan tombol *Pilih Menu* yang tersedia di atas.`);
    }
    return;
  }

  if (state === 'KAS_INPUT_PEMASUKAN' || state === 'KAS_INPUT_PENGELUARAN') {
    const parts = text.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      try {
        const nominal = parseInt(parts[0], 10);
        if (isNaN(nominal)) throw new Error('Nominal tidak valid');

        await prisma.kasTransaction.create({
          data: {
            tenantId,
            type: state === 'KAS_INPUT_PEMASUKAN' ? 'PEMASUKAN' : 'PENGELUARAN',
            amount: nominal,
            category: parts[1],
            description: parts[2] || '',
            date: new Date(),
          },
        });
        await prisma.waSession.update({ where: { id }, data: { state: 'IDLE' } });
        await sendMessage(
          apiKey,
          target,
          `✅ ${state === 'KAS_INPUT_PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'} sebesar Rp ${nominal.toLocaleString('id-ID')} berhasil dicatat.`
        );
      } catch (err) {
        await sendMessage(apiKey, target, `❌ Gagal mencatat transaksi. Pastikan nominal berupa angka.`);
      }
    } else {
      await sendMessage(apiKey, target, `❌ Format tidak sesuai. Pastikan dipisah dengan koma.`);
    }
    return;
  }
};
