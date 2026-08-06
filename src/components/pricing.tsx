import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function Pricing({ pricing, dbProducts }: { pricing?: any, dbProducts?: any[] }) {
  const defaultPricing = [
    {
      name: "TRIAL",
      price: "Rp0",
      period: "Masa aktif 2 hari",
      features: [
        "Token AI",
        "Dashboard RT",
        "Database Warga",
        "Kuota Surat 5 / 2 hari",
        "Arsip Digital",
        "Ai broadcast Pengumuman",
        "Laporan kas (keuangan)",
        "Rekap kegiatan (notulen ai)"
      ]
    },
    {
      name: "STARTER",
      price: "Rp49.000",
      period: "/bulan",
      features: [
        "Token AI",
        "Dashboard RT",
        "Database Warga",
        "Quota Surat 20 surat/bulan",
        "Arsip Digital",
        "Ai broadcast Pengumuman"
      ]
    },
    {
      name: "PRO",
      price: "Rp99.000",
      period: "/bulan",
      popular: true,
      features: [
        "Token AI",
        "Dashboard RT",
        "Database Warga",
        "Kuota Surat 50/bulan",
        "Arsip Digital",
        "Ai broadcast Pengumuman",
        "Laporan kas (keuangan)"
      ]
    },
    {
      name: "PREMIUM",
      price: "Rp149.000",
      period: "/bulan",
      features: [
        "Token AI",
        "Dashboard RT",
        "Database Warga",
        "Kuota Surat 100/bulan",
        "Arsip Digital",
        "Ai broadcast Pengumuman",
        "Laporan kas (keuangan)",
        "Rekap kegiatan (notulen ai)"
      ]
    },
    {
      name: "PLATINUM",
      price: "Rp299.000",
      period: "/bulan",
      features: [
        "Token AI",
        "Dashboard RT",
        "Database Warga",
        "Kuota Surat 100/bulan",
        "Arsip Digital",
        "Ai broadcast Pengumuman",
        "Laporan kas (keuangan)",
        "Rekap kegiatan (notulen ai)",
        "Request Template Surat"
      ]
    }
  ];

  let packages = [];
  const formatRp = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

  const isStringArray = Array.isArray(pricing) && pricing.length > 0 && typeof pricing[0] === "string";

  if (dbProducts && dbProducts.length > 0 && (isStringArray || !pricing || (Array.isArray(pricing) && pricing.length === 0))) {
    let productsToShow = dbProducts;
    
    // Jika user menginputkan array of link/slug seperti ["/product/premium", "/product/platinum"]
    if (isStringArray) {
      productsToShow = pricing.map((path: string) => {
        const slug = path.split('/').pop()?.toLowerCase();
        return dbProducts.find((p: any) => p.slug.toLowerCase() === slug);
      }).filter(Boolean);
    }

    packages = productsToShow.map((p: any) => ({
      name: p.name,
      price: formatRp(p.hargaPendaftaran),
      period: p.masaAktifBulan === 30 ? "/bulan" : `/ ${p.masaAktifBulan} hari`,
      link: `/checkout/${p.slug}`,
      popular: p.name.toLowerCase().includes("pro") || p.name.toLowerCase().includes("premium"), // Auto-popular if it contains Pro/Premium
      features: [
        "Dashboard RT & Arsip Digital",
        "Manajemen Database Warga",
        p.maxSurat === -1 ? "Cetak Surat Tanpa Batas" : p.maxSurat === 0 ? null : `Kuota ${p.maxSurat} Surat/bln`,
        p.maxWarga === -1 ? "Data Warga Tanpa Batas" : p.maxWarga === 0 ? null : `Maksimal ${p.maxWarga} Warga`,
        p.maxAiToken === 0 ? null : `${p.maxAiToken === -1 ? 'Unlimited' : new Intl.NumberFormat('id-ID').format(p.maxAiToken)} Token AI`,
        "Broadcast Pengumuman",
      ].filter(Boolean)
    }));
  } else if (Array.isArray(pricing) && pricing.length > 0 && typeof pricing[0] === "object") {
    // Legacy support for JSON objects
    packages = pricing;
  } else {
    packages = defaultPricing;
  }

  return (
    <section id="harga" className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Pilih Paket Sesuai Kebutuhan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparansi harga tanpa biaya tersembunyi. Mulai digitalisasi lingkungan RT Anda hari ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {packages.map((pkg: any, i: number) => (
            <div 
              key={i} 
              className={`relative flex flex-col rounded-2xl bg-card border ${pkg.popular ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-border'} p-6 transition-transform hover:-translate-y-1`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  TERPOPULER
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">{pkg.name}</h3>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-3xl lg:text-2xl xl:text-xl font-bold">{pkg.price}</span>
                  <span className="text-sm text-muted-foreground font-medium">{pkg.period}</span>
                </div>
              </div>
              
              <ul className="flex-1 space-y-3 mb-6">
                {pkg.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {pkg.link ? (
                <Link href={pkg.link} className="w-full">
                  <Button 
                    variant={pkg.popular ? "default" : "outline"} 
                    className={`w-full ${pkg.popular ? 'glow-effect' : 'hover:bg-primary/5 hover:text-primary'}`}
                  >
                    Pilih Paket
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant={pkg.popular ? "default" : "outline"} 
                  className={`w-full ${pkg.popular ? 'glow-effect' : 'hover:bg-primary/5 hover:text-primary'}`}
                >
                  Pilih Paket
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
