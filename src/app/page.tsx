import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
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
  const pricingJson = settings?.pricing as any;
  const testimonialsJson = settings?.testimonials as any;
  const faqJson = settings?.faq as any;

  let dbProducts: any[] = [];
  try {
    dbProducts = await prisma.product.findMany({ where: { isActive: true } });
  } catch (error) {}

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar logoUrl={settings?.logoUrl} logoUrlDark={settings?.logoUrlDark} session={session} />
      <main className="flex-1">
        <Hero 
          title={settings?.heroTitle} 
          subtitle={settings?.heroSubtitle}
          image={settings?.heroImage}
        />
        <Features features={featuresJson} />
        <HowItWorks />
        <Pricing pricing={pricingJson} dbProducts={dbProducts} />
        <Testimonials testimonials={testimonialsJson} />
        <FAQ faq={faqJson} />
        <CTA />
      </main>
      <Footer footerText={settings?.footerText} logoUrl={settings?.logoUrl} logoUrlDark={settings?.logoUrlDark} />
    </div>
  );
}
