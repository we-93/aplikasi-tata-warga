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
      // Local file
      const filePath = path.join(process.cwd(), 'public', url.startsWith('/') ? url.slice(1) : url);
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

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        tenant: true,
        product: true
      }
    });

    const siteSettings = await prisma.siteSettings.findFirst();

    if (!invoice || !invoice.tenant || !invoice.product) {
      return new NextResponse('Invoice atau Data tidak ditemukan', { status: 404 });
    }

    const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

    const logoB64 = siteSettings?.logoUrl ? await getBase64Image(siteSettings.logoUrl) : '';

    const invoiceDate = new Date(invoice.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const invoiceStatus = invoice.status === 'COMPLETED' ? 'LUNAS / SELESAI' : invoice.status === 'CANCELLED' ? 'DIBATALKAN' : 'MENUNGGU PEMBAYARAN';
    const statusColor = invoice.status === 'COMPLETED' ? '#10b981' : invoice.status === 'CANCELLED' ? '#ef4444' : '#f59e0b';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 40px;
          background-color: #fff;
          font-size: 14px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo-container img {
          max-height: 60px;
          width: auto;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h1 {
          font-size: 32px;
          color: #1b264f;
          margin: 0 0 5px 0;
          letter-spacing: 2px;
        }
        .invoice-title p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        .details-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .details-box {
          width: 45%;
        }
        .details-box h3 {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          border-bottom: 1px solid #eee;
          padding-bottom: 4px;
        }
        .details-box p {
          margin: 4px 0;
          line-height: 1.5;
        }
        .table-container {
          width: 100%;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background-color: #f8fafc;
          color: #1b264f;
          font-weight: bold;
          text-align: left;
          padding: 12px;
          border-bottom: 2px solid #e2e8f0;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .text-right {
          text-align: right;
        }
        .summary-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .summary-box {
          width: 50%;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .summary-row.total {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: #1b264f;
          padding-top: 12px;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #888;
          font-size: 12px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          font-size: 12px;
          background-color: ${statusColor};
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          ${logoB64 ? `<img src="${logoB64}" alt="Tata Warga Logo" />` : '<h2>TATA WARGA</h2>'}
        </div>
        <div class="invoice-title">
          <h1>INVOICE</h1>
          <p>No: <strong>${invoice.invoiceNumber}</strong></p>
          <p>Tanggal: ${invoiceDate}</p>
        </div>
      </div>

      <div class="details-section">
        <div class="details-box">
          <h3>Ditagihkan Kepada</h3>
          <p><strong>${invoice.tenant.name}</strong></p>
          <p>No. Telp / WA: ${invoice.tenant.noHpRt || '-'}</p>
          <p>${invoice.tenant.address || 'Alamat belum diatur'}</p>
          <p>${invoice.tenant.village ? invoice.tenant.village + ', ' : ''}${invoice.tenant.district || ''}</p>
          <p>${invoice.tenant.city || ''} ${invoice.tenant.kodePos || ''}</p>
        </div>
        <div class="details-box">
          <h3>Informasi Pembayaran</h3>
          <p>Tipe Pesanan: <strong>${invoice.orderType === 'NEW' ? 'Langganan Baru' : invoice.orderType === 'RENEW' ? 'Perpanjangan' : invoice.orderType === 'UPGRADE' ? 'Upgrade Paket' : 'Topup Add-on'}</strong></p>
          <div class="status-badge">${invoiceStatus}</div>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Deskripsi Produk</th>
              <th class="text-right">Durasi</th>
              <th class="text-right">Harga Satuan</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Paket: ${invoice.product.name}</strong><br/>
                <span style="font-size: 12px; color: #666;">
                  Maks Warga: ${invoice.product.maxWarga === -1 ? 'Unlimited' : invoice.product.maxWarga} | 
                  Kuota Surat: ${invoice.product.maxSurat === -1 ? 'Unlimited' : invoice.product.maxSurat} | 
                  AI Token: ${invoice.product.maxAiToken === -1 ? 'Unlimited' : invoice.product.maxAiToken}
                </span>
              </td>
              <td class="text-right">${invoice.product.masaAktifBulan} Hari</td>
              <td class="text-right">${formatRp(Number(invoice.amount))}</td>
              <td class="text-right font-bold">${formatRp(Number(invoice.amount))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-section">
        <div class="summary-box">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${formatRp(Number(invoice.amount))}</span>
          </div>
          <div class="summary-row total">
            <span>Total Tagihan</span>
            <span>${formatRp(Number(invoice.amount))}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Terima kasih telah mempercayakan sistem administrasi RT Anda kepada Tata Warga.</p>
        <p>Jika ada pertanyaan terkait tagihan ini, silakan hubungi tim dukungan kami di support@tatawarga.id</p>
      </div>
    </body>
    </html>
    `;

    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "load", timeout: 15000 });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        bottom: '1cm',
        left: '1cm',
        right: '1cm',
      }
    });

    await browser.close();

    const pdfFilename = `Invoice_${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`;

    return new Response(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="${pdfFilename}"`,
      },
    });

  } catch (error: any) {
    console.error("Invoice PDF Generation Error:", error);
    return new NextResponse('Gagal memproses dokumen: ' + error.message, { status: 500 });
  }
}
