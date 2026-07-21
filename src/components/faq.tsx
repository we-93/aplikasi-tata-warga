import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ({ faq }: { faq?: any }) {
  const defaultFaq = [
    {
      question: "Apakah data warga aman di platform ini?",
      answer: "Tentu. Keamanan dan privasi data warga adalah prioritas utama kami. Kami menggunakan enkripsi standar industri dan tidak akan pernah menjual data ke pihak ketiga."
    },
    {
      question: "Apakah bisa diakses melalui HP atau Tablet?",
      answer: "Ya, Tata Warga sepenuhnya responsif (mobile-friendly). Anda dapat mengakses seluruh fitur dari browser di HP, Tablet, maupun PC/Laptop tanpa perlu mengunduh aplikasi tambahan."
    },
    {
      question: "Bagaimana cara kerja fitur Chat AI?",
      answer: "Chat AI kami dirancang untuk membantu merespons pertanyaan warga seputar prosedur administrasi, hingga membantu pengurus membuat draf pengumuman dan merangkum hasil rapat secara otomatis."
    },
    {
      question: "Apakah saya bisa membatalkan langganan kapan saja?",
      answer: "Bisa, sistem kami tidak mengikat Anda dalam kontrak panjang. Anda bisa berhenti berlangganan atau berpindah paket (upgrade/downgrade) kapan saja."
    }
  ];

  const data = faq || defaultFaq;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Pertanyaan Umum</h2>
        </div>

        <Accordion className="w-full space-y-4">
          {data.map((item: any, i: number) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-medium py-4 hover:no-underline hover:text-primary">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
