import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { Features } from "@/components/features";
import { ImpactSection } from "@/components/landing/impact-section";
import { VisionSection } from "@/components/landing/vision-section";
import { Testimonials } from "@/components/testimonials";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { CapacitorRedirect } from "@/components/capacitor-redirect";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  let settings = null;
  
  try {
    settings = await prisma.siteSettings.findFirst({
      where: { tenant_id: null }
    });
  } catch (error) {
    console.log("Database not configured yet, using default frontend values.");
  }

  const featuresJson = settings?.features as any;
  const testimonialsJson = settings?.testimonials as any;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <CapacitorRedirect />
      <Navbar logoUrl={settings?.logoUrl} logoUrlDark={settings?.logoUrlDark} session={session} />
      <main className="flex-1">
        <Hero 
          title={settings?.heroTitle} 
          subtitle={settings?.heroSubtitle}
          image={settings?.heroImage}
        />
        <ProblemSection />
        <SolutionSection />
        <Features features={featuresJson} />
        <ImpactSection />
        <VisionSection />
        <Testimonials testimonials={testimonialsJson} />
        <CTA />
      </main>
      <Footer footerText={settings?.footerText} logoUrl={settings?.logoUrl} logoUrlDark={settings?.logoUrlDark} />
    </div>
  );
}
