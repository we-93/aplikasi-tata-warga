
# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Tata Warga v1.0
**Sistem Administrasi RT Berbasis Web Full-Stack (SaaS Multi-Tenant), WhatsApp Group & AI**

## 1. Ringkasan Produk
 * **Nama Produk:** Tata Warga
 * **Jenis Produk:** Aplikasi Web Full-Stack Modern / Software as a Service (SaaS) Multi-Tenant.
 * **Deskripsi:** Platform manajemen internal RT mandiri di mana Admin (Super Admin) bertindak sebagai pemilik SaaS. Ketua/Pengurus RT menjadi pelanggan berbayar (Tenant) yang mendapatkan akses ke Dashboard Web RT mereka sendiri serta integrasi Bot WhatsApp untuk grup pengurus RT mereka dan mengelola warganya. Warga tidak perlu berinteraksi secara tidak langsung melalui sistem data atau Bot WhatsApp Group pengurus. Cukup RT saja melalui admin role rt dan grup whatsapp inti RT.
 * 
## 2. Tujuan Produk
Menyediakan sistem administrasi RT modern, aman, dan *scalable* yang dapat dijalankan melalui:
• Backend Kontrol Panel untuk admin mengatur seluruh sistem.
 * Backend Dashboard Web RT (endpoint: /dashboard/) untuk mengelola warga, surat, ai asisten, dan paket langganan pribadi.
 * Grup WhatsApp (Interaksi Bot).
 * Fronend (Tampilan Aplikasi Mobile dan terdapat mode tarang dan gelap.
 

## 3. Target Pengguna
 * **Super Admin:** Pemilik platform SaaS yang mengelola paket langganan, verifikasi pembayaran, monitoring sistem, server, dan alokasi nomor Bot WhatsApp.
 * **Tenant (RT):** Pelanggan layanan (Pengurus RT) yang mengelola administrasi RT mereka sendiri melalui Dashboard RT, mendapatkan nomor Bot WhatsApp melalui Group Inti RT mereka, dan memberikan hak akses bot kepada anggota grup.

## 4. Arsitektur Sistem & Arsitektur Multi-Tenant
Aplikasi ini menggunakan pendekatan **Single Database - Shared Schema dengan Tenant Isolation**. Setiap tabel data penting wajib memiliki kolom tenant_id sebagai *foreign key*.
```
[ Frontend: React / Next.js / Vue.js ]
                │  ▲ (REST API / GraphQL)
                ▼  │
[ Backend API Gateway: Node.js (Express/NestJS) / Python (FastAPI) / PHP (Laravel) ]
                │
                ├─► [ Database: PostgreSQL / MySQL ] ── (Isolasi via tenant_id)
                ├─► [ File Storage: AWS S3 / MinIO ] ── (Penyimpanan File PDF & Backup)
                ├─► [ WhatsApp Microservice / Gateway ] ── (Fonnte / Api.co.id)
                ├─► [ AI Engine / Cache: Redis & OpenAI API ]
                └─► [ PDF Generator Service: Puppeteer / Gotenberg ]

```
## 5. Spesifikasi Teknologi (Stack Teknologi)
 * **Frontend:** React.js / Next.js / Vue.js (SPA atau SSR) menggunakan TailwindCSS atau Shadcn/ui untuk komponen UI.
 * **Backend:** Laravel (PHP 8.2+) / NestJS (TypeScript) / Node.js Express / FastAPI.
 * **Database:** MySQL (Dilengkapi dengan index pada tenant_id).
 * **Caching & Session State AI:** Redis.
 * **PDF Engine:** Puppeteer / Gotenberg / Snappy PDF (Menggantikan DomPDF/Elementor untuk performa dan fleksibilitas modern melalui HTML-to-PDF template engine seperti Blade/Edge/Twig).
 * **WhatsApp Gateway:** Fonnte dan Api.co.id.
 * **AI Engine:** OpenAI API (GPT-4o atau model yang setara).
 * **Object Storage:** S3 Maxcloud (Untuk menyimpan file PDF Surat & Backup data).
 * 
## 6. Role & Hak Akses (RBAC)
 * **Super Admin:** Akses penuh ke seluruh sistem manajemen SaaS, billing global, log sistem, dan pengelolaan data seluruh tenant.
 * **RT Admin / Staff RT:** Pengguna dari pihak Tenant yang memiliki hak akses penuh terhadap Dashboard RT terkait (sesuai tenant_id).
 * **WhatsApp Interactor:** Semua nomor telepon yang tergabung di dalam Grup Inti RT yang terdaftar di sistem. Tidak memerlukan akun login web, melainkan divalidasi berdasarkan group_id WhatsApp.

## 7. Multi-Tenant & Data Isolation
 * Setiap request API dari Dashboard RT wajib melalui middleware Autentikasi dan *Tenant Validation*.
 * Query database otomatis menyertakan kondisi WHERE tenant_id = current_tenant_id.
 * Kegagalan isolasi data atau kebocoran data antar-tenant dikategorikan sebagai *Critical Security Vulnerability*.

## 8. Struktur Panel Kontrol Backend (Super Admin Panel)
Menggunakan sistem Codestar Framework WordPress dengan Custom Admin Dashboard.
### Menu Super Admin:
 * **Dasboard (Ringkasan/Card/Statistik)
   * Total RT
   * RT Trial
   * RT Aktif
   * RT Non Aktif
   * Total Warga Seluruh Tenant
   * Pendapat Keseluruhan dan bulan ini
   * Total Bot
   * Bot Online
   * Token Open Ai
 * **Manajemen Pelanggan (Tenant & Billing):**
   * Registrasi RT & Verifikasi Invoice Pembayaran.
   * Daftar Tenant RT Aktif/Nonaktif.
 * **Manajemen Template Surat:**
   * Pengaturan Jenis Surat.
   * Template Editor (Buat seperti post editor klasik wordpress, terdapat font, ukuran font/tajuk, suport placeholder. Dibawah tek editor tedapat pengaturan ukuran surat A4/Folio, ukuran margin kanan, kiri, atas, bawah).
   * Arsip Surat Global.
 * **Manajemen Keuangan Global:**
   * Log pembayaran langganan SaaS dari RT.
 * **Manajemen WhatsApp Gateway:**
   * Multi-device API Key manager (Fonnte & Api.co.id).
   * Monitoring Status Bot (Online/Offline) dan pembagian beban Slot RT per nomor WhatsApp.
 * **Manajemen AI Assistant:**
   * Master System Prompt configuration.
   * Monitoring penggunaan API Key OpenAI & Limit Kuota Token.
 * **Pengaturan Sistem & Server:**
   * Cron job status, SMTP Email, apikey whatsapp gateway untuk notifikasi dari admin kepala pelanggan, dan Manajemen Backup.
 * **Log Aktivitas & Audit Trail Global.**

### 8.B Struktur Panel Kontrol Backend (Dashboard RT Panel)
Setiap halaman dashboard ini dilekatkan pada middleware tenant (tenant_id) untuk memastikan pengurus RT hanya dapat memanipulasi data lingkungan mereka sendiri.
#### Menu Dashboard RT:
 * **Dashboard Utama (Ringkasan/Card/Statistik):
   * Total Warga dan Penambahan Warga Bulan ini (card)
   * Total Surat Dibuat, Jumlah Surat Dibuat Bulan Ini, dan Kuota Surat (card)
   * Saldo Saat ini, pemasukan/pengeluaran bulan ini (card)
   * Status Langganan dan sisa masa aktif (card)
   * Tabel 5 Surat Terakhir.
   * Log aktivitas singkat internal RT.
 * **Manajemen Data Warga:**
   * Tabel Data Warga (Server-side Pagination & Search).
   * Form CRUD Tambah/Edit Data Warga.
   * Tombol Aksi: **Import Excel** dan **Export Excel** data warga internal RT.
 * **Pelayanan Surat & Dokumen:**
   * **Buat Surat:** Form input NIK (auto-complete data warga), pilihan jenis template surat, dan tombol *Generate PDF*.
   * **Arsip Surat RT:** Daftar seluruh surat yang pernah di-generate lengkap dengan tanggal, nama warga, jenis surat, dan tautan unduhan aman (*Signed URL*) ke Object Storage.
 * **Manajemen Keuangan Kas RT:**
   * Tabel Transaksi Kas (Pemasukan & Pengeluaran).
   * Form Input Transaksi Baru (Nominal, Kategori, Keterangan, Tanggal).
   * Tombol Aksi: **Cetak Laporan Kas** (Ekspor PDF/Excel untuk periode tertentu).
 * **Pusat Kendali AI Assistant:**
   * **Broadcast AI:** Halaman untuk menyusun teks pengumuman massal berbasis AI yang nantinya disalin ke grup WhatsApp.
   * **Chat AI Dashboard:** Antarmuka obrolan berbasis web untuk berinteraksi dengan AI menggunakan konteks data RT sendiri (alternatif selain lewat WhatsApp).
   * **Laporan AI:** Fitur generator otomatis untuk membuat draf laporan kegiatan atau laporan ringkasan kas berbasis AI.
 * **Manajemen Paket & Billing Langganan:**
   * Informasi Paket Aktif & Masa Berlaku.
   * Riwayat Pembayaran/Invoice Langganan RT ke Platform.
   * Tombol Aksi: **Perpanjang Paket** atau **Upgrade Kuota** (Mengarahkan ke halaman checkout).
 * **Pengaturan RT & Integrasi:**
   * Profil RT (Nama Ketua RT, Alamat RT, Kontak).
   * **Konfigurasi WhatsApp:** Status online di Fontte atau Api.co.id

## 9. Skema Endpoint API & Routing Web
Seluruh endpoint di bawah ini dilindungi oleh JWT (JSON Web Token) atau Session Cookie Authentication berbasis Role Server-Side.
### A. Endpoints Super Admin
 * Dashboard UI: /admin/dashboard
 * Data RT/Tenant: /admin/tenants
 * Data Warga Global: /admin/citizens
 * Arsip Surat Global: /admin/letters
 * Manajemen Keuangan Platform: /admin/billing
 * Pengaturan WhatsApp & AI: /admin/integrations
 * Manajemen Affiliate & Payout: /admin/affiliates & /admin/affiliates/payouts
 * Manajemen User Admin: /admin/users
 * Log Aktivitas Global: /admin/logs

### B. Endpoints Tenant RT (Dashboard RT)
 * Dashboard UI: /dashboard/rt
 * Manajemen Warga: /dashboard/rt/warga
 * Buat Surat Baru: /dashboard/rt/surat/create
 * Arsip Surat RT: /dashboard/rt/surat/arsip
 * Manajemen Kas RT: /dashboard/rt/kas
 * AI Panel (Broadcast, Chat, Laporan): /dashboard/rt/ai
 * Manajemen Langganan & Add-on: /dashboard/rt/billing
 * Pengaturan Profil RT & WhatsApp Group ID: /dashboard/rt/settings

### C. Endpoints Publik & Autentikasi
 * Login / Register / Forgot Password: /auth/login, /auth/register, /auth/forgot-password
 * Checkout Produk: /checkout/{product-slug}
 * Halaman Pembayaran & Invoice: /invoice/{id}
 * Halaman Terima Kasih: /checkout/success

## 10. Alur Registrasi Tenant RT Baru
 1. Calon Pelanggan (RT) membuka halaman /checkout/{product-slug}.
 2. Mengisi formulir registrasi (Email digunakan sebagai Unique Identifier/Username).
 3. Sistem membuat order invoice dan mengarahkan user ke /invoice/{id}.
 4. Setelah melakukan pembayaran, status berada dalam mode Pending Verification.
 5. Super Admin memverifikasi, menginput WhatsApp Group ID tujuan, dan menyetujui akun.
 6. **Sistem Otomatis Melakukan Pekerjaan Latar Belakang (Background Job):**
   * Membuat data User baru & menetapkannya sebagai Admin Tenant.
   * Inisialisasi tenant_id dan tabel konfigurasi default RT tersebut.
   * Mengirimkan notifikasi via WhatsApp/Email berisi Kredensial Login, Nomor Bot WhatsApp tujuan, Link grup, serta panduan aktivasi sistem.
 7. Akun Tenant & Bot dinyatakan Aktif.

## 11. Modul Produk & Skema Paket Langganan
Super Admin dapat membuat skema paket berlangganan dengan batasan (Limiter/Throttling Middleware) berbasis database:
 * Masa Aktif Akun: bulanan/tahunan
 * Kuota Cetak PDF
 * Kuota Penggunaan Ai Asisten Per Interaksi.
 * Nomor Bot WA
 * Harga Pendaftaran
 * Harga Perpanjangan
 

## 12. Modul Data Warga
 * **Struktur Data (Schema):** id, tenant_id, nik (Unique per tenant), no_kk, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, no_hp, status_warga, alamat, created_at, updated_at.
 * **Fitur:** CRUD API, Pencarian Cepat (Indexing pada NIK & Nama), Fitur Import/Export berbasis format .xlsx (menggunakan library server-side seperti ExcelJS atau PhpSpreadsheet).

## 13. Modul Pembuatan Surat & Template Engine
 1. RT memilih Jenis Surat melalui dashboard web.
 2. RT memasukkan NIK warga -> Sistem memuat data warga secara reaktif melalui API endpoint /api/warga/{nik}.
 3. Sistem melakukan rendering HTML Template dengan menyuntikkan data variabel placeholder (misal: {{warga.nama}}, {{warga.nik}}).
 4. HTML dikirim ke PDF Engine (misal: Puppeteer) untuk di-*convert* menjadi dokumen PDF standar perkantoran.
 5. File PDF diunggah ke Object Storage, menghasilkan URL unduhan yang aman dan siap dikirim atau diarsipkan.
 6. Jika Nik tidak ditemukan, terdapat tombol tambah warga.
 
## 14. Modul Pengelolaan Kas RT
 * Mencatat transaksi dengan tipe: PEMASUKAN atau PENGELUARAN.
 * Menghitung akumulasi saldo secara berkala (dapat dibantu dengan pencatatan ledger atau kalkulasi agregat terindeks).
 * Menyediakan laporan mutasi kas bulanan/tahunan yang dapat diunduh dalam format PDF atau Excel.

## 15. Arsitektur WhatsApp Webhook & Integrasi Bot
Aplikasi backend menyediakan endpoint publik Webhook khusus (misal: /api/v1/webhooks/whatsapp) untuk menerima kiriman data muatan (payload) dari Fonnte / Api.co.id.
### Logika Pemrosesan Pesan:
 1. **Validasi Group ID:** Sistem membaca properti group_id atau sender_group dari payload JSON. Jika group_id tidak terdaftar pada tabel tenant manapun, abaikan pesan.
 2. **Command Parsing:** Sistem mendeteksi pesan awal seperti #MENU, #WARGA, #SURAT, #KAS, atau #AKTIFKAN AI.
### Komunikasi Alur Menu WhatsApp (Stateful Conversation)
Untuk menangani alur multi-step (misalnya: Mengisi form warga via chat), backend menggunakan **Redis Key-Value Storage** untuk menyimpan *State Session* sementara berdasarkan kombinasi group_id dan sender_number.
*Contoh State:* tenant:102:session:chat_status = "WAITING_FOR_NIK".

#### Alur Menu #WARGA via WhatsApp:
Ketua RT
↓
#MENU
↓
Bot
Selamat datang di Tata Warga 👋

Silakan pilih menu:
#WARGA
#SURAT
#KAS RT
#AKTIFKAN AI
↓
Ketua RT
#WARGA
↓
Bot

Menu Data Warga
1. Tambah Warga
2. Cari Warga 
3. Edit Warga 
4. Hapus Warga 
 
Jika RT ketik 1 (Tambah Warga)
↓
Bot
Form Tambah Warga
Nama:
NIK:
Tempat Lahir:
Tanggal Lahir:
Alamat:
Pekerjaan:
Agama:
No. Whastapp:
Status:

↓
Ketua RT Kirim form yang sudah diisi
↓
Bot
Warga Berhasil Ditambahkan

------

Jika RT ketik 2 (Cari Warga )
↓
Bot
Masukan NIK (16 Digit):
↓ 
RT input NIK
↓
Bot
Menampilkan Data Warga

------ 

Jika RT ketik 3 (Edit Warga)
↓
Bot
Masukan NIK (16 Digit):
↓ 
RT input NIK
↓
Bot
Menampilkan Data Warga Untuk Diedit
↓
Ketua RT Kirim form yang sudah diedit
↓
Bot
Warga Berhasil Diedit

------

Jika RT ketik 4 ( Hapus Warga)
↓
Bot
Masukan NIK (16 Digit):
↓ 
RT input NIK
↓
Bot
Data Warga (Nama Lengkap) Berhasil Dihapus


#### Alur Menu #SURAT via WhatsApp:
Ketua RT
↓
#Surat
↓
Bot
Pilih Jenis Surat:
↓ 
Ketua RT Ketik Angka berdasarkan jenis surat
↓
Bot
Masukan NIK (16 Digit)
↓
Ketu RT Input NIK
↓
Bot
Kondisi 1 Jika NIK Ditemukan (Bot mengambil data dari database) dan langsung mengirim form surat:

Form Surat.....

Nomor & Kode Surat:    /kode_surat/RT...-RW.../bulan_romawi/tahun
Nama:
NIK:
Tempat Lahir:
Tanggal Lahir:
Alamat:
Pekerjaan:
(Catatan: Setiap jenis surat berbeda-beda datanya, sesuai admin yg atur di dashboard)

Ketik:
1 = Buat Surat
2 = Edit Surat
3 = Batal
↓
Ketua RT
Jika 1
↓
Bot
Surat Berhasil Dibuat
Nama:
NIK:
Jenis Surat:
Link Pdf:

Jika Ketua RT  ketik 2 (edit surat)
↓
Bot
Kirim form jenis surat, datanya dari database:
↓
Ketua RT kirm balik form yang sudah diedit
↓
Bot
Surat Berhasil Dibuat (kurangi kuota) 
Nama:
NIK:
Jenis Surat:
Link Pdf:

Jika Ketua RT  ketik 3 (batal)
↓
Bot
Permintaan Pembuatan Surat Dibatalkan


Ketu RT Input NIK
↓
Bot
Kondisi 2 Jika NIK Tidak Ditemukan (Bot mengambil data dari database) dan langsung mengirim form surat:

↓
Bot
NIK Tidak Ditemukan:
Ketik:
1 = Lanjut Buat Suart + Tambah Warga
2 = batal
↓
Ketua RT Ketik 1 
↓
Bot
Kirim form jenis surat
↓
Ketua RT isi Form dan kirim ke Bot
↓
Bot
Surat Berhasil Dibuat (kurangi kuota)
Nama:
NIK:
Jenis Surat:
Link Pdf:

Catatan: Jika membuat surat dengan NIK baru, simpan datanya di daftar semua warga, jika kurang lengkap, RT bisa edit dikemudian hari.

#### Alur Menu #KAS via WhatsApp:
Ketua RT
↓
#KAS RT
↓
Bot
Pilih jenis layanan:
1. Pemasukan
2. Pengeluaran
3. Saldo
4. Laporan Kas 

Semua data di dashboard dapat terkoneksi di whatsapp


## 16. Integrasi AI Assistant dengan Konteks Data Lokal (RAG / Data Context Injection)
Sesi interaktif AI dimulai secara eksklusif saat pengguna mengetik #AKTIFKAN AI.
```
[ Pesan User di WA Group ] ──► [ Backend Webhook ]
                                       │
                  ┌────────────────────┴────────────────────┐
                  ▼                                         ▼
         [ Ambil Data Tenant ]                     [ Ambil Riwayat Chat ]
     (Data Warga, Kas, Surat dari SQL)             (Dari Cache Redis/DB)
                  │                                         │
                  └────────────────────┬────────────────────┘
                                       ▼
                       [ Bangun System Prompt + Context ]
                                       ▼
                       [ Kirim ke OpenAI API Gateway ]
                                       ▼
                       [ Bot Balas Jawaban ke WA Group ]

```
 1. **State Activation:** Ketika #AKTIFKAN AI dikirim, Redis akan menyimpan key dengan status AI_SESSION_ACTIVE = true yang memiliki waktu kedaluwarsa otomatis (*Time-to-Live / TTL*) selama 10 menit.
 2. **Context Assembly:** Setiap kali ada pertanyaan baru selama sesi aktif, backend melakukan *query rapid data* internal sesuai tenant_id grup tersebut (Total Kas, Ringkasan Warga, Jumlah Surat).
 3. **Prompt Engineering:** Data tersebut dilekatkan ke dalam request payload OpenAI API sebagai *Context Dynamic Information*.
 4. **Guardrail AI:** System prompt secara ketat menginstruksikan AI untuk: *"Hanya menjawab berdasarkan fakta data terlampir dari tenant terkait. Jika data tidak ada, katakan tidak tahu. Dilarang keras melakukan halusinasi atau mengarang data keuangan/warga."*
 5. **Deaktivasi Sesi:** Sesi ditutup jika pengguna mengetik #SELESAI atau ketika batas waktu Redis TTL (10 menit tanpa interaksi baru) habis.
## 17. Pengaturan Keamanan Platform (Security Hardening)
 * **Data Isolation:** Pemanfaatan *Scoped Query Hooks* atau *Global Query Filtering* di tingkat ORM backend untuk memastikan data antar-tenant tidak pernah bocor.
 * **API Protection:** Proteksi terhadap serangan CSRF untuk *stateful session* web, perlindungan SQL Injection (menggunakan parameterized queries/ORM seperti Prisma, Sequelize, atau Eloquent), serta implementasi pembatasan laju request API (*Rate Limiting* via Redis).
 * **Input Sanitization:** Menggunakan library validator (seperti Zod, Joi, atau Form Request Validator) untuk membersihkan seluruh input dari skrip berbahaya (XSS Protection).
 * **Secure File Access:** File PDF Surat disimpan di Object Storage privat dengan akses publik terbatas atau menggunakan *Signed URLs* dengan masa kedaluwarsa singkat (misal: link hanya aktif selama 15 menit).

## 18. Metafield (mendukung pemanggilan placholder {{...}})

# A. Data Warga

| Meta Key               | Keterangan        |
| ---------------------- | ----------------- |
| `tw_nik`               | NIK               |
| `tw_no_kk`             | Nomor KK          |
| `tw_nama_lengkap`      | Nama Lengkap      |
| `tw_nama_panggilan`    | Nama Panggilan    |
| `tw_tempat_lahir`      | Tempat Lahir      |
| `tw_tanggal_lahir`     | Tanggal Lahir     |
| `tw_jenis_kelamin`     | Jenis Kelamin     |
| `tw_agama`             | Agama             |
| `tw_alamat`            | Alamat            |
| `tw_status_perkawinan` | Status Perkawinan |
| `tw_pekerjaan`         | Pekerjaan         |
| `tw_pendidikan`        | Pendidikan        |
| `tw_kewarganegaraan`   | Kewarganegaraan   |
| `tw_golongan_darah`    | Golongan Darah    |
| `tw_no_hp`             | Nomor HP          |
| `tw_email`             | Email             |
| `tw_foto`              | Foto Warga        |

---

# B. Tenant RT

| Meta Key          | Keterangan     |
| ----------------- | -------------- |
| `tw_sekretariat`  | Sekretariat    |
| `tw_rt`           | RT             |
| `tw_ketua_rt`     | Nama Ketua RT  |
| `tw_rw`           | RW             |
| `tw_ketua_rw`     | Nama Ketua RW  |
| `tw_desa`         | Desa/Kelurahan |
| `tw_kecamatan`    | Kecamatan      |
| `tw_kabupaten`    | Kabupaten/Kota |
| `tw_provinsi`     | Provinsi       |
| `tw_kode_pos`     | Kode Pos       |
| `tw_no_rumah`     | Nomor Rumah    |
| `tw_no_hp_rt      | Nomor HP RT    |
| `tw_logo_rt`      | Logo RT        |
| `tw_stempel_rt`   | Stempel RT     |
| `tw_ttd_rt`       | Tanda Tangan RT|

---

# C. Keluarga

| Meta Key             | Keterangan      |
| -------------------- | --------------- |
| `tw_status_dalam_kk` | Status dalam KK |
| `tw_nama_ayah`       | Nama Ayah       |
| `tw_nama_ibu`        | Nama Ibu        |
| `tw_nama_pasangan`   | Nama Pasangan   |
| `tw_jumlah_anak`     | Jumlah Anak     |

---

# D. Administrasi

| Meta Key            | Keterangan             |
| ------------------- | ---------------------- |
| `tw_status_warga`   | Aktif/Pindah/Meninggal |
| `tw_tanggal_masuk`  | Tanggal Menjadi Warga  |
| `tw_tanggal_keluar` | Tanggal Keluar         |
| `tw_keterangan`     | Catatan                |

---

# E. Surat

| Meta Key           | Keterangan    |
| ------------------ | ------------- |
| `tw_nomor_surat`   | Nomor Surat   |
| `tw_kode _surat`   | Kode Surat    |
| `tw_tanggal_surat` | Tanggal Surat |
| `tw_keperluan`     | Keperluan     |
| `tw_tujuan_surat`  | Tujuan Surat  |
| `tw_masa_berlaku`  | Masa Berlaku  |
| `tw_penandatangan` | Penandatangan |

---

# F. Kas Warga

| Meta Key               | Keterangan        |
| ---------------------- | ----------------- |
| `tw_saldo_kas`         | Saldo Kas         |
| `tw_iuran_bulanan`     | Iuran Bulanan     |
| `tw_total_iuran`       | Total Iuran       |
| `tw_tunggakan`         | Tunggakan         |
| `tw_status_pembayaran` | Status Pembayaran |

---

# G. WhatsApp

| Meta Key         | Keterangan        |
| ---------------- | ----------------- |
| `tw_wa_bot`      | Nomor Bot    |
| `tw_wa_verified` | Status Verifikasi |
| `tw_wa_group`    | ID Grup WhatsApp  |

---

# H. AI

| Meta Key        | Keterangan   |
| --------------- | ------------ |
| `tw_ai_summary` | Ringkasan AI |
| `tw_ai_notes`   | Catatan AI   |
| `tw_ai_tags`    | Tag AI       |

---

## 19. Performa & Skalabilitas (Non-Functional Requirements)
 * **Database Optimization:** Penambahan Database Indexes secara spesifik pada kolom pencarian intensif seperti tenant_id, nik, no_kk, dan created_at.
 * **Asynchronous Processing:** Proses pembuatan file PDF berukuran besar, pengiriman pesan broadcast WhatsApp massal, dan logging eksternal wajib dilempar ke sistem *Message Queue* (seperti BullMQ atau RabbitMQ) agar tidak membebani performa utama HTTP API Request.
 * **Stateless Backend:** Aplikasi backend dirancang sepenuhnya *stateless* agar dapat dideploy di lingkungan containerized (Docker / Kubernetes) dan siap ditingkatkan skalanya secara horizontal (*Horizontal Auto-scaling*) saat jumlah tenant meningkat.
 * **Monitoring:** Dilengkapi dengan sistem monitoring performa server dan aplikasi (seperti Prometheus, Grafana, atau Sentry) untuk menangkap error secara *real-time*.



## 20. Ruang Lingkup Rilis Versi 1.0 (Scope of MVP)
### Termasuk:
 * Arsitektur Full-Stack SaaS Multi-Tenant (Aplikasi Web Terpusat).
 * Frontend yang dapat di edit melalui Backend.
 * Backend Admin untuk mengatur seluruh sistem
 * Dashboard Admin Untuk rekap dan memantau data
 * Dashboard Tenant RT untuk mengelola administrasi warganya.
 * Sistem Langganan dan Manajemen Invoice Terintegrasi.
 * Modul CRUD Warga (Web + Eksport/Import Excel).
 * Modul Kas RT & Cetak Laporan Keuangan.
 * Template Engine Surat & Server-Side HTML-to-PDF Converter.
 * Webhook WhatsApp Router & State Machine Chat (Redis).
 * Context-Aware AI Assistant Session terisolasi per Tenant.
 * Log Audit Sistem komprehensif.
### Belum Termasuk (Diluar Scope):
 * Pengiriman berkas fisik PDF langsung secara binary media via WhatsApp (V1.0 hanya berupa tautan url unduhan aman).
 * Sistem Auto-Billing Payment Gateway otomatis (V1.0 menggunakan verifikasi manual invoice oleh Admin).
 * Aplikasi Native Mobile (iOS / Android).

## 21. Definisi Selesai (Definition of Done - DoD)
Aplikasi Web Full-Stack Tata Warga v1.0 dinyatakan siap rilis ke tahap *Production* apabila:
 * Seluruh modul backend API lolos uji *Integration Testing* dan fungsi CRUD berjalan sempurna.
 * Mekanisme keamanan isolasi data Multi-Tenant telah diuji coba secara ketat dan terbukti tidak terjadi kebocoran data antar tenant_id.
 * Aplikasi web responsif dan dapat diakses dengan lancar melalui peramban Desktop maupun Mobile.
 * Webhook dari WhatsApp Gateway terhubung dengan lancar serta Redis mampu mengelola *State Session* percakapan tanpa terjadi *deadlock*.
 * AI Assistant mampu membaca konteks data internal secara tepat dan mematuhi batas operasional (*guardrails*) yang telah ditetapkan.
 * Dokumentasi API (seperti Swagger / OpenAPISpec) telah tersedia dengan lengkap untuk kemudahan pemeliharaan kode ke depan.
 * 




Apa fitur krusial yang ingin Anda garap atau sempurnakan sekarang? Apakah kita perlu:

Mengerjakan Formulir Halaman Checkout RT (tempat mengunggah bukti bayar yang sesungguhnya)?
Atau ada fitur lain (sistem pencatatan kas RT, notulen AI, dll)?