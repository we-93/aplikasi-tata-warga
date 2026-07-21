import Image from "next/image";
import { Star } from "lucide-react";

export function Testimonials({ testimonials }: { testimonials?: any }) {
  const defaultData = [
    {
      name: "Budi Santoso",
      role: "Ketua RT 01/RW 05, Lowokwaru, Kota Malang",
      quote: "Tata Warga sangat membantu mempercepat pelayanan administrasi di lingkungan kami. Pembuatan surat kini hanya membutuhkan beberapa menit dan data warga tersimpan dengan rapi.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT2.png",
      rating: 5
    },
    {
      name: "Agus Setiawan",
      role: "Sekretaris RT 07/RW 04, Kuranji, Kota Padang",
      quote: "Asisten WhatsApp benar-benar memudahkan pekerjaan saya. Banyak administrasi bisa dilakukan langsung melalui WhatsApp tanpa harus selalu membuka dashboard.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT1.png",
      rating: 5
    },
    {
      name: "Rahma Fauziyah",
      role: "Bendahara RT 03/RW 02, Gubeng, Surabaya",
      quote: "Fitur Kas RT membuat pencatatan keuangan jauh lebih mudah dan transparan. Saya tidak lagi menggunakan buku kas manual karena semuanya sudah tersimpan secara digital.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT3.png",
      rating: 5
    },
    {
      name: "Hendra Wijaya",
      role: "Admin RT 02/RW 01, Kotagede, Kota Yogyakarta",
      quote: "AI Assistant sangat membantu dalam membuat pengumuman dan merangkum hasil rapat. Waktu yang biasanya habis untuk mengetik kini bisa digunakan untuk kegiatan warga.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT4.png",
      rating: 5
    },
    {
      name: "Slamet Riyadi",
      role: "Ketua RT 05/RW 03, Banjarsari, Kota Surakarta",
      quote: "Visual Letter Builder sangat fleksibel dan mudah digunakan. Saya bisa menyesuaikan format surat sesuai kebutuhan lingkungan tanpa bantuan programmer.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT4.png",
      rating: 5
    },
    {
      name: "Rudi Hartono",
      role: "Admin RT 08/RW 06, Banyumanik, Semarang",
      quote: "Dashboard Tata Warga tampil sederhana namun lengkap. Semua informasi penting seperti data warga, surat, dan kas RT dapat diakses dalam satu tempat.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT9.png",
      rating: 5
    },
    {
      name: "Dedi Kurniawan",
      role: "Ketua RT 04/RW 02, Denpasar Selata, Denpasar",
      quote: "Arsip digital menjadi fitur favorit saya karena semua surat tersimpan dengan aman. Saat dibutuhkan, saya tinggal mencari dan mengunduhnya kembali tanpa kesulitan.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT7.png",
      rating: 5
    },
    {
      name: "Yusuf Maulana",
      role: "Sekretaris RT 06/RW 01, Ilir Timur I, Kota Palembang",
      quote: "Proses pendaftaran hingga aktivasi sangat cepat. Setelah akun aktif, saya langsung bisa menggunakan Dashboard RT dan Asisten WhatsApp untuk melayani warga.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT6.png",
      rating: 5
    },
    {
      name: "Siti Maesaroh",
      role: "Ketua RT 09/RW 05, Cibeunying Kaler, Kota Bandung",
      quote: "Pelayanan administrasi di lingkungan kami menjadi jauh lebih profesional. Warga tidak perlu menunggu lama karena surat dapat dibuat dan dibagikan dalam bentuk PDF.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT8.png",
      rating: 5
    },
    {
      name: "Ella Musani",
      role: "Bendahara RT 10/RW 07, Sukajadi, Pekanbaru",
      quote: "Sejak menggunakan Tata Warga, administrasi RT menjadi lebih tertata dan modern. Semua data tersimpan aman, mudah dicari, dan pekerjaan harian terasa jauh lebih ringan.",
      avatar: "https://s3.maxcloud.id/tatawarga/avatar/Avatar%20RT10.png",
      rating: 5
    }
  ];

  const activeData = Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : defaultData;
  const duplicatedData = [...activeData, ...activeData];

  return (
    <section className="py-16 md:py-24 bg-muted/30 overflow-hidden relative">
      <style>{`
        @keyframes scroll-testimonials {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1rem)); }
        }
        .animate-scroll-testimonials {
          animation: scroll-testimonials 50s linear infinite;
        }
        .animate-scroll-testimonials:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="container px-4 md:px-6 mx-auto mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Cerita Pengguna Kami</h2>
          <p className="text-muted-foreground">
            Mendengar langsung pengalaman pengurus RT yang telah bertransformasi ke arah digital.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex">
        {/* Fading gradients on edges */}
        <div className="absolute top-0 left-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex gap-6 md:gap-8 px-6 animate-scroll-testimonials w-max hover:pause">
          {duplicatedData.map((item, i) => (
            <div 
              key={i} 
              className="w-[300px] md:w-[400px] flex-shrink-0 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow cursor-default"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(item.rating)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                  "{item.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                  <Image src={item.avatar} alt={item.name} fill className="object-cover" unoptimized />
                </div>
                <div>
                  <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
