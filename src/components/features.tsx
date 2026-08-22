"use client";

import { motion } from "framer-motion";
import { Database, Shield, Smartphone, FileText, PieChart, MessageSquare, Users, Wallet, LayoutGrid, Settings, Home, Activity, CreditCard, Cloud, Bot, Sparkles, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Features({ features }: { features?: any }) {
  const whyFeaturesList = [
    {
      title: "Keamanan Data Tinggi",
      description: "Data warga dan laporan keuangan RT disimpan di server terenkripsi yang memenuhi standar keamanan industri. Privasi warga adalah prioritas utama.",
      icon: Shield,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Pengelolaan Laporan",
      description: "Sistem secara otomatis menghasilkan grafik dan rekapitulasi untuk memudahkan pelaporan kas. Tak perlu lagi repot menghitung manual.",
      icon: PieChart,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Akses Fleksibel",
      description: "Akses platform kapan saja dan di mana saja. Terintegrasi sepenuhnya dengan ponsel pintar atau PC Anda untuk kenyamanan ekstra.",
      icon: Smartphone,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Administrasi Surat",
      description: "Buat dan setujui surat pengantar atau keterangan domisili hanya dalam hitungan detik. Semua surat memiliki riwayat yang jelas.",
      icon: FileText,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    },
    {
      title: "Notulen Rapat AI",
      description: "Rapat pengurus RT kini didukung oleh AI yang mampu merangkum hasil musyawarah dan keputusan secara otomatis menjadi dokumen PDF.",
      icon: Database,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      title: "Siaran Langsung",
      description: "Gunakan fitur pengumuman yang otomatis terkirim ke seluruh warga via WhatsApp tanpa perlu membagikannya satu per satu secara manual.",
      icon: MessageSquare,
      color: "text-red-500",
      bg: "bg-red-500/10"
    }
  ];

  const data = Array.isArray(features) && features.length > 0 ? features : whyFeaturesList;

  // Icon mapping for JSON data
  const iconMap: any = {
    "shield": Shield,
    "piechart": PieChart,
    "pie-chart": PieChart,
    "smartphone": Smartphone,
    "filetext": FileText,
    "file-text": FileText,
    "database": Database,
    "messagesquare": MessageSquare,
    "message-square": MessageSquare,
    "users": Users,
    "wallet": Wallet,
    "layoutgrid": LayoutGrid,
    "settings": Settings,
    "home": Home,
    "activity": Activity,
    "creditcard": CreditCard,
    "cloud": Cloud,
    "bot": Bot,
    "sparkles": Sparkles,
    "zap": Zap
  };

  return (
    <div className="w-full">
      {/* Mengapa Tata Warga Section */}
      <section id="fitur" className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Mengapa Tata Warga?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sistem yang dirancang khusus untuk mempermudah tata kelola lingkungan dengan transparansi tinggi dan efisiensi waktu berbasis AI.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {data.map((feature: any, i: number) => {
              const iconKey = typeof feature.icon === 'string' ? feature.icon.toLowerCase().replace(/[-_ ]/g, '') : '';
              const IconComp = iconKey ? (iconMap[iconKey] || Shield) : (feature.icon || Shield);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="h-full border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4 md:p-6 flex flex-col items-center md:items-start text-center md:text-left h-full">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3 md:mb-4 ${feature.bg || 'bg-primary/10'}`}>
                        <IconComp className={`w-5 h-5 md:w-6 md:h-6 ${feature.color || 'text-primary'}`} />
                      </div>
                      <h3 className="text-sm md:text-lg font-semibold mb-2 leading-tight">{feature.title}</h3>
                      <p className="text-muted-foreground text-[11px] md:text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
