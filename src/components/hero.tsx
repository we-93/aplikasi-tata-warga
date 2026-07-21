import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AnimatedHeroDashboard } from "./animated-hero-dashboard";

export function Hero({
  title,
  subtitle,
  image,
}: {
  title?: string | null;
  subtitle?: string | null;
  image?: string | null;
}) {
  const displayTitle = title || "Transformasi Digital Manajemen Warga dalam Satu Platform";
  const displaySubtitle = subtitle || "Fasilitasi komunikasi, kelola administrasi secara efektif, dan pantau keuangan RT/RW dengan mudah dan transparan menggunakan layanan Tata Warga berbasis WhatsApp dan AI.";

  return (
    <section id="home" className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-background">
      <div className="container px-4 md:px-6 mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Manajemen Warga Modern
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight drop-shadow-sm">
            {displayTitle.split("Manajemen Warga").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i !== arr.length - 1 && (
                  <span className="text-primary glow-text-mobile sm:glow-text"> Manajemen Warga </span>
                )}
              </span>
            ))}
            {displayTitle.indexOf("Manajemen Warga") === -1 && displayTitle}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {displaySubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="#harga" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base font-semibold glow-effect group">
                Coba Gratis Sekarang
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
            <Link href="#kontak" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-base font-semibold border-primary/20 hover:bg-primary/5">
                Hubungi Kami
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 md:mt-24 max-w-5xl mx-auto relative group">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 dark:opacity-80 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
          <div className="relative rounded-2xl border border-border/50 bg-background/50 p-2 md:p-4 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-primary/10">
            {/* Window controls mockup */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 flex space-x-2 z-20">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            
            <div className="bg-card rounded-xl overflow-hidden relative aspect-[16/10] md:aspect-[16/9] w-full border border-border">
              {image ? (
                <Image src={image} alt="Dashboard Tata Warga" fill className="object-cover" />
              ) : (
                <AnimatedHeroDashboard />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
}
