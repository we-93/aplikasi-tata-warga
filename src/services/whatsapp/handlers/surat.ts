import prisma from '@/lib/prisma';
import { sendMessage } from '@/lib/whatsapp';

export const handleSuratState = async (
  session: any,
  message: string,
  apiKey: string,
  target: string
) => {
  const text = message.trim();
  const { id, state, tenantId } = session;

  if (state === 'MENU_SURAT') {
    const selectedIndex = parseInt(text) - 1;
    const sessionData = session.data as { templates?: any[] };
    
    if (isNaN(selectedIndex) || !sessionData.templates || !sessionData.templates[selectedIndex]) {
      await sendMessage(apiKey, target, `✉️ Pilihan tidak valid. Silakan balas dengan angka yang sesuai.`);
      return;
    }

    const template = sessionData.templates[selectedIndex];
    await prisma.waSession.update({
      where: { id },
      data: { state: 'SURAT_INPUT_NIK', data: { templateId: template.id, templateCode: template.code, templateName: template.name } },
    });
    await sendMessage(apiKey, target, `✉️ Masukan NIK (16 Digit) pemohon surat:`);
    return;
  }

  if (state === 'SURAT_INPUT_NIK') {
    const nik = text;
    const sessionData = session.data as { templateId: string, templateCode: string, templateName: string };
    
    const warga = await prisma.warga.findUnique({
      where: { tenantId_nik: { tenantId, nik } },
    });

    if (warga) {
      // Warga found, proceed normally
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const rt = tenant?.rt || "000";
      const rw = tenant?.rw || "000";
      
      const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
      const currentMonth = romanMonths[new Date().getMonth()];
      const currentYear = new Date().getFullYear();
      
      const kodeSurat = `${sessionData.templateCode}/RT${rt}-RW${rw}/${currentMonth}/${currentYear}`;
      
      // Auto-generate sequence number
      const count = await prisma.suratArsip.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(currentYear, new Date().getMonth(), 1)
          }
        }
      });
      const generatedNomorSurat = (count + 1).toString().padStart(3, '0');

      // Fetch template to parse tags
      const template = await prisma.suratTemplate.findUnique({ where: { id: sessionData.templateId } });
      const htmlContent = template?.contentHtml || '';
      
      // Extract all {{tw_...}} tags
      const regex = /\{\{tw_([a-zA-Z0-9_]+)\}\}/g;
      let match;
      const customTags = new Set<string>();
      
      const standardTags = [
        'nomor_surat', 'kode_surat', 'tanggal_surat', 'rt', 'rw', 'desa', 
        'kecamatan', 'kabupaten', 'provinsi', 'ketua_rt', 'ketua_rw', 'no_hp_rt',
        'sekretariat', 'kode_pos', 'logo_rt', 'ttd_rt', 'stempel_rt',
        'nik', 'no_kk', 'nama_lengkap', 'nama_panggilan', 'tempat_lahir',
        'tanggal_lahir', 'jenis_kelamin', 'agama', 'alamat', 'status_perkawinan',
        'pekerjaan', 'pendidikan', 'golongan_darah', 'no_hp', 'email'
      ];

      while ((match = regex.exec(htmlContent)) !== null) {
        const tag = match[1];
        let isMissingStandard = false;

        // Check if it's a standard tag but the Warga data is missing
        if (tag === 'agama' && !warga.agama) isMissingStandard = true;
        if (tag === 'pekerjaan' && !warga.pekerjaan) isMissingStandard = true;
        if (tag === 'pendidikan' && !warga.pendidikan) isMissingStandard = true;
        if (tag === 'golongan_darah' && !warga.golonganDarah) isMissingStandard = true;
        if (tag === 'status_perkawinan' && !warga.statusNikah) isMissingStandard = true;
        if (tag === 'no_hp' && !warga.noHp) isMissingStandard = true;
        if (tag === 'email' && !warga.email) isMissingStandard = true;

        if (!standardTags.includes(tag) || isMissingStandard) {
          customTags.add(tag);
        }
      }

      await prisma.waSession.update({
        where: { id },
        data: { 
          state: 'SURAT_KONFIRMASI', 
          data: { 
            ...sessionData, 
            nik, 
            nomorSurat: generatedNomorSurat, 
            kodeSurat: kodeSurat,
            wargaId: warga.id,
            customTags: Array.from(customTags),
            customData: {} // To store answers
          } 
        },
      });
      
      const dateStr = warga.tanggalLahir ? warga.tanggalLahir.toISOString().split('T')[0] : '1990-01-01';
      const wargaCsv = `${warga.namaLengkap}, ${warga.nik}, ${warga.tempatLahir}, ${dateStr}, ${warga.alamat}, ${warga.agama}, ${warga.jenisKelamin}, ${warga.noHp}`;

      await sendMessage(
        apiKey,
        target,
        `✉️ Data ditemukan:\nNAMA: ${warga.namaLengkap}\nNomor Surat:\n${generatedNomorSurat}/${kodeSurat}\n\nData Lengkap Warga:\n${wargaCsv}\n\nKetik 1 = Buat Surat, 2 = Batal\n*(Atau balas dengan menyalin pesan ini jika ingin mengubah data surat)*`
      );
    } else {
      await prisma.waSession.update({
        where: { id },
        data: { state: 'SURAT_NOT_FOUND_OPTION', data: { ...sessionData, nik } },
      });
      await sendMessage(
        apiKey,
        target,
        `❌ NIK Tidak Ditemukan\nKetik 1 = Batal\nKetik 2 = Lanjut Buat Surat (data warga akan tersimpan otomatis)`
      );
    }
    return;
  }

  if (state === 'SURAT_NOT_FOUND_OPTION') {
    if (text === '1') {
      await sendMessage(apiKey, target, `✉️ Pembuatan surat dibatalkan.`);
      await prisma.waSession.update({ where: { id }, data: { state: 'IDLE', data: {} } });
    } else if (text === '2') {
      const sessionData = session.data as any;
      await prisma.waSession.update({
        where: { id },
        data: { state: 'SURAT_INPUT_NEW_WARGA', data: sessionData },
      });
      await sendMessage(
        apiKey,
        target,
        `Silakan balas pesan ini dengan format:\nNAMA, NIK, TEMPAT LAHIR, TANGGAL LAHIR (YYYY-MM-DD), ALAMAT, AGAMA, JENIS KELAMIN, PEKERJAAN, NO HP\n\nContoh:\nBudi Santoso, 3201010101010101, Jakarta, 1990-01-01, Jl. Merdeka 1, Islam, LAKI_LAKI, Karyawan Swasta, 0812345678`
      );
    } else {
      await sendMessage(apiKey, target, `Pilihan tidak valid. Ketik 1 atau 2.`);
    }
    return;
  }

  if (state === 'SURAT_INPUT_NEW_WARGA') {
    const sessionData = session.data as any;
    
    // Parse Smart CSV
    const lines = text.split('\n');
    let csvLine = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].split(',').length >= 9) {
        csvLine = lines[i];
        break;
      }
    }

    if (!csvLine) {
      await sendMessage(apiKey, target, `❌ Format tidak valid. Pastikan terdapat 8 tanda koma (,). Silakan ulangi pengisian:`);
      return;
    }

    const parts = csvLine.split(',').map(p => p.trim());
    const [namaLengkap, nikParsed, tempatLahir, tanggalLahirStr, alamat, agama, jenisKelaminRaw, pekerjaan, noHp] = parts;
    
    // Gender Sanitizer
    const jkUpper = jenisKelaminRaw.toUpperCase().replace(/[- ]/g, '');
    const jenisKelamin = jkUpper.includes('PEREMPUAN') || jkUpper.includes('WANITA') || jkUpper.includes('CEWE') ? 'PEREMPUAN' : 'LAKI_LAKI';

    let tanggalLahir = new Date(1990, 0, 1);
    if (!isNaN(Date.parse(tanggalLahirStr))) {
      tanggalLahir = new Date(tanggalLahirStr);
    }

    try {
      const newWarga = await prisma.warga.create({
        data: {
          tenantId,
          nik: nikParsed || sessionData.nik,
          noKk: '-',
          namaLengkap,
          tempatLahir,
          tanggalLahir,
          alamat,
          agama,
          jenisKelamin,
          pekerjaan,
          noHp,
        }
      });
      
      // Now mimic what SURAT_INPUT_NIK does:
      // Setup the queue and auto-generate number
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const rt = tenant?.rt || "000";
      const rw = tenant?.rw || "000";
      
      const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
      const currentMonth = romanMonths[new Date().getMonth()];
      const currentYear = new Date().getFullYear();
      
      const kodeSurat = `${sessionData.templateCode}/RT${rt}-RW${rw}/${currentMonth}/${currentYear}`;
      const count = await prisma.suratArsip.count({
        where: { tenantId, createdAt: { gte: new Date(currentYear, new Date().getMonth(), 1) } }
      });
      const generatedNomorSurat = (count + 1).toString().padStart(3, '0');

      const template = await prisma.suratTemplate.findUnique({ where: { id: sessionData.templateId } });
      const htmlContent = template?.contentHtml || '';
      
      const regex = /\{\{tw_([a-zA-Z0-9_]+)\}\}/g;
      let match;
      const customTags = new Set<string>();
      
      const standardTags = [
        'nomor_surat', 'kode_surat', 'tanggal_surat', 'rt', 'rw', 'desa', 
        'kecamatan', 'kabupaten', 'provinsi', 'ketua_rt', 'ketua_rw', 'no_hp_rt',
        'sekretariat', 'kode_pos', 'logo_rt', 'ttd_rt', 'stempel_rt',
        'nik', 'no_kk', 'nama_lengkap', 'nama_panggilan', 'tempat_lahir',
        'tanggal_lahir', 'jenis_kelamin', 'agama', 'alamat', 'status_perkawinan',
        'pekerjaan', 'pendidikan', 'golongan_darah', 'no_hp', 'email'
      ];

      while ((match = regex.exec(htmlContent)) !== null) {
        const tag = match[1];
        let isMissingStandard = false;
        if (tag === 'agama' && !newWarga.agama) isMissingStandard = true;
        if (tag === 'pekerjaan' && !newWarga.pekerjaan) isMissingStandard = true;
        if (tag === 'pendidikan' && !newWarga.pendidikan) isMissingStandard = true;
        if (tag === 'golongan_darah' && !newWarga.golonganDarah) isMissingStandard = true;
        if (tag === 'status_perkawinan' && !newWarga.statusNikah) isMissingStandard = true;
        if (tag === 'no_hp' && !newWarga.noHp) isMissingStandard = true;
        if (tag === 'email' && !newWarga.email) isMissingStandard = true;

        if (!standardTags.includes(tag) || isMissingStandard) {
          customTags.add(tag);
        }
      }

      const updatedSessionData = { 
        ...sessionData, 
        nik: newWarga.nik, 
        nomorSurat: generatedNomorSurat, 
        kodeSurat: kodeSurat,
        wargaId: newWarga.id,
        customTags: Array.from(customTags),
        customData: {}
      };
      
      // If there are missing tags, start the queue directly!
      const missingTags = updatedSessionData.customTags;
      if (missingTags.length > 0) {
        await prisma.waSession.update({
          where: { id },
          data: { state: 'SURAT_KONFIRMASI', data: updatedSessionData },
        });
        const displayTag = missingTags[0].replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        await sendMessage(apiKey, target, `✅ Warga berhasil ditambahkan.\n✉️ Masukkan data untuk ${displayTag}:`);
      } else {
        // No tags to fill, just create the surat!
        const arsip = await prisma.suratArsip.create({
          data: {
            tenantId,
            templateId: updatedSessionData.templateId,
            wargaId: updatedSessionData.wargaId,
            nomorSurat: updatedSessionData.nomorSurat,
            kodeSurat: updatedSessionData.kodeSurat,
            customData: {},
          }
        });
        
        const downloadUrl = `https://tatawarga.net/api/surat/${arsip.id}/download?download=1`;
        
        await sendMessage(
          apiKey,
          target,
          `✅ Warga berhasil ditambahkan.\n✉️ Surat Berhasil Dibuat!\n\nJenis Surat: ${updatedSessionData.templateName}\nNomor: ${updatedSessionData.nomorSurat}/${updatedSessionData.kodeSurat}\n\nDownload PDF:\n${downloadUrl}\n\nSurat ini juga sudah tercatat di Dashboard Arsip Surat RT Anda.`
        );
        await prisma.waSession.update({ where: { id }, data: { state: 'IDLE', data: {} } });
      }

    } catch (e: any) {
      await sendMessage(apiKey, target, `❌ Gagal menambahkan warga. Pastikan NIK belum terdaftar. Ketik apapun untuk mengulang.`);
    }
    return;
  }

  if (state === 'SURAT_KONFIRMASI') {
    const sessionData = session.data as { 
      nik: string; 
      templateId: string; 
      templateName: string; 
      nomorSurat: string; 
      kodeSurat: string;
      wargaId: string;
      customTags?: string[];
      customData?: Record<string, string>;
    };
    
    // Check if user is replying with custom tags
    const lines = text.split('\n');
    const customDataUpdates: Record<string, string> = { ...(sessionData.customData || {}) };
    let parsedAnyCustom = false;
    let parsedNewNomor = sessionData.nomorSurat;
    let parsedNewKode = sessionData.kodeSurat;

    lines.forEach(line => {
      // Parse Nomor Surat override: "Nomor Surat:\n015/SKTM/..."
      if (line.includes('/') && line.length < 50 && !line.includes(':')) {
        const parts = line.split('/');
        if (parts.length >= 1 && !line.includes(',')) { // Avoid matching CSV line
          parsedNewNomor = line.trim(); // Save the ENTIRE overridden string as nomorSurat
          parsedNewKode = ''; // Empty out kodeSurat so PDF renders properly
          parsedAnyCustom = true;
        }
      }

      // Parse custom tags like *Keperluan:* Bikin KTP
      const tagMatch = line.match(/^\*([a-zA-Z0-9_ ]+):\*(.*)/);
      if (tagMatch) {
        const displayTag = tagMatch[1].trim().toLowerCase().replace(/ /g, '_');
        const val = tagMatch[2].trim();
        // Match displayTag back to actual tag
        const actualTag = sessionData.customTags?.find(t => t.toLowerCase() === displayTag);
        if (actualTag) {
          customDataUpdates['tw_' + actualTag] = val;
          parsedAnyCustom = true;
        }
      }
    });

    if (parsedAnyCustom) {
      // Update session with new custom data and/or nomor surat
      await prisma.waSession.update({
        where: { id },
        data: { state: 'SURAT_KONFIRMASI', data: { ...sessionData, customData: customDataUpdates, nomorSurat: parsedNewNomor, kodeSurat: parsedNewKode } },
      });
      
      // Check if all custom tags are filled
      const missingTags = sessionData.customTags?.filter(tag => !customDataUpdates['tw_' + tag]) || [];
      if (missingTags.length > 0) {
        const displayTag = missingTags[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        await sendMessage(apiKey, target, `✉️ Masukkan data untuk ${displayTag}:`);
        return;
      }
      
      const currentFullNomor = parsedNewKode ? `${parsedNewNomor}/${parsedNewKode}` : parsedNewNomor;
      await sendMessage(
        apiKey,
        target,
        `✉️ Data tersimpan! Nomor: ${currentFullNomor}\n\nKetik:\n1 = Buat Surat\n2 = Batal`
      );
      return;
    }

    if (text === '1') {
      // Ensure all custom tags are filled
      const missingTags = sessionData.customTags?.filter(tag => !sessionData.customData?.['tw_' + tag]) || [];
      if (missingTags.length > 0) {
        const displayTag = missingTags[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        await sendMessage(apiKey, target, `✉️ Masukkan data untuk ${displayTag}:`);
        return;
      }

      // Create actual Arsip Surat in database
      const arsip = await prisma.suratArsip.create({
        data: {
          tenantId,
          templateId: sessionData.templateId,
          wargaId: sessionData.wargaId,
          nomorSurat: sessionData.nomorSurat,
          kodeSurat: sessionData.kodeSurat,
          customData: sessionData.customData || {},
        }
      });
      
      const downloadUrl = `https://tatawarga.net/api/surat/${arsip.id}/download?download=1`;
      const finalNomorStr = sessionData.kodeSurat ? `${sessionData.nomorSurat}/${sessionData.kodeSurat}` : sessionData.nomorSurat;
      
      await sendMessage(
        apiKey,
        target,
        `✉️ Surat Berhasil Dibuat!\n\nJenis Surat: ${sessionData.templateName}\nNomor: ${finalNomorStr}\n\nDownload PDF:\n${downloadUrl}\n\nSurat ini juga sudah tercatat di Dashboard Arsip Surat RT Anda.`
      );
      await prisma.waSession.update({ where: { id }, data: { state: 'IDLE', data: {} } });
      
    } else if (text === '2') {
      await sendMessage(apiKey, target, `✉️ Pembuatan surat dibatalkan.`);
      await prisma.waSession.update({ where: { id }, data: { state: 'IDLE', data: {} } });
      
    } else {
      // If it's not 1 or 2, and no custom tags were parsed, but there's a missing tag queue
      const missingTags = sessionData.customTags?.filter(tag => !sessionData.customData?.['tw_' + tag]) || [];
      if (missingTags.length > 0) {
        const tagToFill = missingTags[0];
        const updatedData = { ...sessionData.customData, ['tw_' + tagToFill]: text };
        
        await prisma.waSession.update({
          where: { id },
          data: { state: 'SURAT_KONFIRMASI', data: { ...sessionData, customData: updatedData } },
        });

        const newMissing = sessionData.customTags?.filter(tag => !updatedData['tw_' + tag]) || [];
        if (newMissing.length > 0) {
          const displayTag = newMissing[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          await sendMessage(apiKey, target, `✉️ Masukkan data untuk ${displayTag}:`);
        } else {
          const finalNomorStr = sessionData.kodeSurat ? `${sessionData.nomorSurat}/${sessionData.kodeSurat}` : sessionData.nomorSurat;
          await sendMessage(
            apiKey,
            target,
            `✉️ Seluruh data lengkap! Nomor: ${finalNomorStr}\n\nKetik:\n1 = Buat Surat\n2 = Batal`
          );
        }
      } else {
        await sendMessage(
          apiKey,
          target,
          `✉️ Balasan tidak valid.\n\nKetik:\n1 = Buat Surat\n2 = Batal`
        );
      }
    }
    return;
  }
};
