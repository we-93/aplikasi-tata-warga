import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

async function getBase64Image(url: string | null) {
  if (!url) return '';
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const response = await fetch(url);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/png';
        return `data:${contentType};base64,${buffer.toString('base64')}`;
      }
    } else {
      const filePath = path.join(process.cwd(), 'public', url);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).replace('.', '') || 'png';
        const base64 = fs.readFileSync(filePath).toString('base64');
        return `data:image/${ext};base64,${base64}`;
      }
    }
  } catch (e) {
    console.error("Error reading image:", e);
  }
  return '';
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === '1';

    const arsip = await prisma.suratArsip.findUnique({
      where: { id },
      include: {
        template: true,
        warga: true,
        tenant: true
      }
    });

    if (!arsip || !arsip.template) {
      return new NextResponse('Surat tidak ditemukan', { status: 404 });
    }

    const { template, warga, tenant } = arsip;

    if (!template.contentHtml) {
      return new NextResponse('Format surat tidak valid (Bukan HTML)', { status: 400 });
    }

    let htmlContent = template.contentHtml;
    const logoB64 = await getBase64Image(tenant.logoUrl);
    const ttdB64 = await getBase64Image(tenant.signatureUrl);
    const stampB64 = await getBase64Image(tenant.stampUrl);

    const date = new Date(arsip.createdAt);
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const month = romanMonths[date.getMonth()];
    const year = date.getFullYear();
    const rt = tenant.rt || '000';
    const rw = tenant.rw || '000';
    let kodeSurat = arsip.kodeSurat;
    if (kodeSurat === null) {
       kodeSurat = `${template.code}/RT${rt}-RW${rw}/${month}/${year}`;
    }
    
    // User manual input is stored in arsip.nomorSurat
    const nomorSuratFinal = arsip.nomorSurat && arsip.nomorSurat.trim() !== '' ? arsip.nomorSurat : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';

    const replacements: Record<string, string> = {
      'tw_nomor_surat': nomorSuratFinal,
      'tw_kode_surat': kodeSurat,
      'tw_tanggal_surat': new Date(arsip.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      'tw_rt': tenant.rt || '-',
      'tw_rw': tenant.rw || '-',
      'tw_desa': tenant.village || '-',
      'tw_kecamatan': tenant.district || '-',
      'tw_kabupaten': tenant.city || '-',
      'tw_provinsi': tenant.province || '-',
      'tw_ketua_rt': tenant.ketuaName || '-',
      'tw_ketua_rw': tenant.namaRw || '-',
      'tw_no_hp_rt': tenant.noHpRt || '-',
      'tw_sekretariat': tenant.address || '-',
      'tw_kode_pos': tenant.kodePos || '-',
      'tw_logo_rt': logoB64 ? `<img src="${logoB64}" style="max-height: 80px; width: auto;" />` : '',
      'tw_ttd_rt': ttdB64 ? `<img src="${ttdB64}" style="max-height: 80px; width: auto;" />` : '',
      'tw_stempel_rt': stampB64 ? `<img src="${stampB64}" style="max-height: 80px; width: auto; opacity: 0.8;" />` : '',
    };

    if (warga) {
      Object.assign(replacements, {
        'tw_nik': warga.nik,
        'tw_no_kk': warga.noKk,
        'tw_nama_lengkap': warga.namaLengkap,
        'tw_nama_panggilan': warga.namaPanggilan || '-',
        'tw_tempat_lahir': warga.tempatLahir || '-',
        'tw_tanggal_lahir': warga.tanggalLahir ? new Date(warga.tanggalLahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-',
        'tw_jenis_kelamin': warga.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan',
        'tw_agama': warga.agama || '-',
        'tw_alamat': warga.alamat || '-',
        'tw_status_perkawinan': warga.statusNikah || '-',
        'tw_pekerjaan': warga.pekerjaan || '-',
        'tw_pendidikan': warga.pendidikan || '-',
        'tw_golongan_darah': warga.golonganDarah || '-',
        'tw_no_hp': warga.noHp || '-',
        'tw_email': warga.email || '-',
      });
    }

    // Merge customData fields
    if (arsip.customData && typeof arsip.customData === 'object') {
      const customVars = arsip.customData as Record<string, string>;
      Object.keys(customVars).forEach(key => {
        replacements[key] = customVars[key] || '';
      });
    }

    // Special handling for completely overridden nomor surat (kodeSurat === '')
    if (arsip.kodeSurat === '') {
      htmlContent = htmlContent.replace(/\{\{tw_nomor_surat\}\}\/\{\{tw_kode_surat\}\}/g, nomorSuratFinal);
      htmlContent = htmlContent.replace(/\{\{tw_nomor_surat\}\} \/ \{\{tw_kode_surat\}\}/g, nomorSuratFinal);
    }

    Object.keys(replacements).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, replacements[key]);
    });

    const width = template.paperSize === 'FOLIO' ? '8.5in' : '210mm';
    const height = template.paperSize === 'FOLIO' ? '13in' : '297mm';

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            color: #000;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td, th {
            vertical-align: top;
            padding: 2px 4px;
          }
          hr {
            border: none;
            border-top: 3px solid black;
            border-bottom: 1px solid black;
            height: 2px;
            margin: 15px 0;
          }
          p { margin-bottom: 0.5rem; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "domcontentloaded", timeout: 15000 });

    const pdf = await page.pdf({
      width,
      height,
      printBackground: true,
      margin: {
        top: `${template.marginTop}cm`,
        bottom: `${template.marginBottom}cm`,
        left: `${template.marginLeft}cm`,
        right: `${template.marginRight}cm`,
      }
    });

    await browser.close();

    const safeNama = warga ? warga.namaLengkap.replace(/[^a-zA-Z0-9 ]/g, '') : 'Tanpa_Nama';
    const filenameKode = kodeSurat.replace(/\//g, '_');
    const pdfFilename = `${safeNama} - ${filenameKode}.pdf`;

    return new Response(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="${pdfFilename}"`,
      },
    });

  } catch (error: any) {
    console.error("Document Generation Error:", error);
    return new NextResponse('Gagal memproses dokumen: ' + error.message, { status: 500 });
  }
}
