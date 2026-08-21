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
  return (
    <section id="home" className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-background">
      <div className="container px-4 md:px-6 mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Manajemen Data Modern
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight drop-shadow-sm uppercase">
            TATA WARGA
          </h1>
          
          <h2 className="text-xl md:text-2xl text-muted-foreground font-semibold">
            (Teknologi Andal Tata Kelola Administrasi Warga)
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4">
            Transformasi Digital Manajemen Warga dalam Satu Platform
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base font-semibold bg-[#6419c1] hover:bg-[#7735d4] text-white shadow-lg group">
                Daftar Gratis Sekarang
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Button>
            </Link>
            <a href="/tata-warga.apk" download className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base font-semibold bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg group">
                Unduh Tata Warga .apk
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-y-1 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-16 md:mt-24 max-w-sm mx-auto relative group">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50 dark:opacity-80 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
          <div className="relative rounded-2xl border border-border/50 bg-background/50 p-2 md:p-4 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-primary/10">
            {/* Window controls mockup */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 flex space-x-2 z-20">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            
            <div className="bg-card rounded-xl overflow-hidden relative aspect-[9/19] w-full border border-border">
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
