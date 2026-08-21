export function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Daftar Akun",
      desc: "Lakukan pendaftaran secara gratis untuk membuat ruang kerja bagi lingkungan RT Anda."
    },
    {
      num: "2",
      title: "Setup Lingkungan",
      desc: "Masuk ke Dashboard, lengkapi profil RT, logo, dan susunan kepengurusan."
    },
    {
      num: "3",
      title: "Unduh Aplikasi",
      desc: "Unduh dan pasang aplikasi Tata Warga .apk di perangkat Android Anda & warga."
    },
    {
      num: "4",
      title: "Sistem Aktif",
      desc: "Dashboard, manajemen warga, dan fitur administrasi surat otomatis siap digunakan."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Cara Memulai Tata Warga</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Ikuti 4 langkah sederhana berikut untuk mendigitalkan lingkungan Anda.
          </p>
        </div>

        <div className="relative">
          {/* Horizontal Line for Desktop */}
          <div className="hidden md:block absolute top-8 left-1/8 right-1/8 h-0.5 bg-primary-foreground/20"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-background text-primary flex items-center justify-center text-2xl font-bold shadow-lg mb-6 border-4 border-primary">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-primary-foreground/80 text-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
