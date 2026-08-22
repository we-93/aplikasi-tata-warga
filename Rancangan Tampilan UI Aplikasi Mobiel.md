Sekarang mari bungkus menjadi file .apk khusus Dashboard RT
# Rancangan Tampilan UI Aplikasin Android
## Terdapat Menu Bawah: Beranda, Warga, Tombol Plus, Surat, Pengaturan
### Beranda berisi:
* header seperti saat ini
* teks "Selamat Datang Ketua RT {{rt}}/RW {{rw (font tebal)
* tanggal hari ini (font tipis)
* Kartu Total Warga  Warna Ungu (Jumlah KK dan Jumlah Jiwa)
* Kartu Kas RT Warna Ungu: Total Kas (Teks Besar dan font tebal) dibawahnya total pemasukan ikon panah bawah dan total pengeluaran ikon atas (dalam satu baris) jumlah pemasukan dan pengeluaran ini akan diperbarui menjadi 0 setiap tanggal 1 setiap bulannya.
* 
* **Teks Menu Utama:**  berisi menu bulat dengan ikon pintasan ke halaman - setiap baris beris 4 menu:
** Data Warga /dashboard/rt/warga
** Surat Surat /dashboard/rt/surat
** Statistik /dashboard/rt/warga/statistik
** Kas RT /dashboard/rt/kas tampilkan tombol Laporan (/dashboard/rt/ai/report), Import, dan Export
** Chat Ai /dashboard/rt/ai/chat
** Notulen /dashboard/rt/notulen/rapat
** Pengumuman /dashboard/rt/notulen/pengumuman
** Log /dashboard/rt/logs
* **Warga** menampilakn halaman /dashboard/rt/warga dengan 3 tombol dalam 1 baris: Statistik, Imprt, dan Export 
* **Tombol Plus** Sebuah Tombol Plus dengan DIbungkus dengan Lingkaran (Background lingkaran berwan ungu dan ikon plus berwarna kuning) menampilkan tindakan cepat: tambah KK/warga, buat surat, Tambah Catata Kas
* **Surat:** Hanya Menampilkan Judul, Kolom Pencarian, Filter Berdasarkan jenis Surat, dan Arsip Surat
* **Pengaturan:** Berisi Card-Card Dengan Ikon >:
** Profil Saya /dashboard/rt/settings/akun
** Profil RT /dashboard/rt/settings/profil
** Template Surat /dashboard/rt/surat/template
** Tutorial https://docs.tatawarga.web.id/
** Tentang Aplikasi buatkan isinya /dashboard/rt/about
** Bantuan arahkan ke https://api.whatsapp.com/send?phone=6281934197955&text=Halo%20Admin%20Tata%20Warga%2C%20mohon%20dibantu%20untuk....
** Keluar (logout)