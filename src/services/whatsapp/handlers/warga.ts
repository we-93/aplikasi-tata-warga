import prisma from '@/lib/prisma';
import { sendMessage } from '@/lib/whatsapp';

export const handleWargaState = async (
  session: any,
  message: string,
  apiKey: string,
  target: string
) => {
  const text = message.trim();
  const { id, state, tenantId } = session;

  if (state === 'MENU_WARGA') {
    if (text === '1') {
      await prisma.waSession.update({
        where: { id },
        data: { state: 'WARGA_ADD_FORM' },
      });
      await sendMessage(
        apiKey,
        target,
        `Form Tambah Warga\n\nSilakan balas pesan ini dengan format:\nNAMA, NIK, TEMPAT LAHIR, TANGGAL LAHIR (YYYY-MM-DD), ALAMAT, AGAMA, JENIS KELAMIN, PEKERJAAN, NO HP\n\nContoh:\nBudi Santoso, 3201010101010101, Jakarta, 1990-01-01, Jl. Merdeka 1, Islam, LAKI_LAKI, Karyawan Swasta, 0812345678`
      );
    } else if (text === '2') {
      await prisma.waSession.update({
        where: { id },
        data: { state: 'WARGA_CARI' },
      });
      await sendMessage(apiKey, target, `Masukan NIK (16 Digit):`);
    } else if (text === '3') {
      await prisma.waSession.update({
        where: { id },
        data: { state: 'WARGA_EDIT_CARI' },
      });
      await sendMessage(apiKey, target, `Masukan NIK (16 Digit) yang ingin diedit:`);
    } else if (text === '4') {
      await prisma.waSession.update({
        where: { id },
        data: { state: 'WARGA_HAPUS' },
      });
      await sendMessage(apiKey, target, `Masukan NIK (16 Digit) yang ingin dihapus:`);
    } else {
      await sendMessage(apiKey, target, `Pilihan tidak valid. Silakan balas dengan angka 1, 2, 3, atau 4.`);
    }
    return;
  }

  if (state === 'WARGA_ADD_FORM') {
    // Smart parsing: Find the line with at least 8 commas (9 items)
    const lines = text.split('\n');
    const dataLine = lines.find(line => line.split(',').length >= 9) || text;
    
    // Basic CSV parsing
    const parts = dataLine.split(',').map((p) => p.trim());
    if (parts.length >= 9) {
      try {
        await prisma.warga.create({
          data: {
            tenantId,
            namaLengkap: parts[0],
            nik: parts[1],
            tempatLahir: parts[2],
            tanggalLahir: new Date(parts[3]),
            alamat: parts[4],
            agama: parts[5],
            jenisKelamin: parts[6].toUpperCase().replace(/[- ]/g, '').match(/(PEREMPUAN|WANITA|CEWE)/) ? 'PEREMPUAN' : 'LAKI_LAKI',
            pekerjaan: parts[7],
            noHp: parts[8],
            noKk: '-', // Placeholder
          },
        });
        await prisma.waSession.update({ where: { id }, data: { state: 'IDLE' } });
        await sendMessage(apiKey, target, `Data Warga ${parts[0]} Berhasil Ditambahkan.`);
      } catch (err) {
        await sendMessage(apiKey, target, `Gagal menambahkan warga. Pastikan NIK belum terdaftar dan format tanggal benar (YYYY-MM-DD).`);
      }
    } else {
      await sendMessage(apiKey, target, `Format tidak sesuai. Pastikan dipisah dengan koma sebanyak 9 isian.`);
    }
    return;
  }

  if (state === 'WARGA_CARI') {
    const nik = text;
    const warga = await prisma.warga.findUnique({
      where: { tenantId_nik: { tenantId, nik } },
    });
    if (warga) {
      await sendMessage(
        apiKey,
        target,
        `Data Warga Ditemukan:\nNama: ${warga.namaLengkap}\nNIK: ${warga.nik}\nAlamat: ${warga.alamat}\nAgama: ${warga.agama}\nNo HP: ${warga.noHp}\nStatus: ${warga.statusWarga}`
      );
    } else {
      await sendMessage(apiKey, target, `Data Warga dengan NIK ${nik} tidak ditemukan.`);
    }
    await prisma.waSession.update({ where: { id }, data: { state: 'IDLE' } });
    return;
  }

  if (state === 'WARGA_EDIT_CARI') {
    const nik = text;
    const warga = await prisma.warga.findUnique({
      where: { tenantId_nik: { tenantId, nik } },
    });
    if (warga) {
      await prisma.waSession.update({
        where: { id },
        data: { state: 'WARGA_EDIT_FORM', data: { nik } },
      });
      const dateStr = warga.tanggalLahir ? warga.tanggalLahir.toISOString().split('T')[0] : '1990-01-01';
      await sendMessage(
        apiKey,
        target,
        `Data ditemukan:\nNAMA: ${warga.namaLengkap}\n\nSilakan salin (copy) seluruh pesan ini, ubah datanya di bagian bawah, lalu kirim kembali:\n\n${warga.namaLengkap}, ${warga.nik}, ${warga.tempatLahir}, ${dateStr}, ${warga.alamat}, ${warga.agama}, ${warga.jenisKelamin}, ${warga.pekerjaan || 'Pekerjaan'}, ${warga.noHp}`
      );
    } else {
      await sendMessage(apiKey, target, `Data Warga dengan NIK ${nik} tidak ditemukan.`);
      await prisma.waSession.update({ where: { id }, data: { state: 'IDLE' } });
    }
    return;
  }

  if (state === 'WARGA_EDIT_FORM') {
    // Smart parsing: Find the line with at least 8 commas (9 items)
    const lines = text.split('\n');
    const dataLine = lines.find(line => line.split(',').length >= 9) || text;

    const parts = dataLine.split(',').map((p) => p.trim());
    if (parts.length >= 9) {
      const sessionData = session.data as { nik: string };
      try {
        await prisma.warga.update({
          where: { tenantId_nik: { tenantId, nik: sessionData.nik } },
          data: {
            namaLengkap: parts[0],
            nik: parts[1],
            tempatLahir: parts[2],
            tanggalLahir: new Date(parts[3]),
            alamat: parts[4],
            agama: parts[5],
            jenisKelamin: parts[6].toUpperCase().replace(/[- ]/g, '').match(/(PEREMPUAN|WANITA|CEWE)/) ? 'PEREMPUAN' : 'LAKI_LAKI',
            pekerjaan: parts[7],
            noHp: parts[8],
          },
        });
        await prisma.waSession.update({ where: { id }, data: { state: 'IDLE', data: {} } });
        await sendMessage(apiKey, target, `Data Warga Berhasil Diedit.`);
      } catch (err) {
        await sendMessage(apiKey, target, `Gagal mengedit warga.`);
      }
    } else {
      await sendMessage(apiKey, target, `Format tidak sesuai. Pastikan dipisah dengan koma sebanyak 9 isian.`);
    }
    return;
  }

  if (state === 'WARGA_HAPUS') {
    const nik = text;
    try {
      const warga = await prisma.warga.findUnique({ where: { tenantId_nik: { tenantId, nik } } });
      if (warga) {
        await prisma.warga.delete({ where: { tenantId_nik: { tenantId, nik } } });
        await sendMessage(apiKey, target, `Data Warga ${warga.namaLengkap} Berhasil Dihapus.`);
      } else {
        await sendMessage(apiKey, target, `Data Warga dengan NIK ${nik} tidak ditemukan.`);
      }
    } catch (err) {
      await sendMessage(apiKey, target, `Gagal menghapus warga.`);
    }
    await prisma.waSession.update({ where: { id }, data: { state: 'IDLE' } });
    return;
  }
};
