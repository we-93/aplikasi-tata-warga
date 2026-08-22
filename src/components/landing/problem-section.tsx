"use client";

import { motion, Variants } from "framer-motion";
import { Clock, FileText, Users } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: Clock,
      title: "Waktu Terbatas",
      description: "Ketua RT umumnya memiliki pekerjaan utama. Waktu untuk mengurus administrasi warga seringkali sangat terbatas dan dilakukan di sela-sela kesibukan."
    },
    {
      icon: FileText,
      title: "Administrasi Manual",
      description: "Data warga masih dicatat dalam buku, surat dibuat satu per satu secara manual, dan arsip disimpan dalam tumpukan map fisik."
    },
    {
      icon: Users,
      title: "Kendala Komunikasi",
      description: "Warga yang sibuk sering kesulitan menyesuaikan waktu untuk bertemu langsung dengan Ketua RT saat mengurus kebutuhan administrasi."
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="py-20 md:py-32 bg-slate-50 dark:bg-black/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6419c1]/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500 dark:text-red-400 mb-4">
            Tantangan Saat Ini
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Tanggung Jawab Besar,<br/>Waktu Terbatas.</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Ketua RT adalah garda terdepan pelayanan masyarakat. Namun, proses administrasi yang masih manual membuat tugas mulia ini menjadi beban yang sangat berat.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 relative z-10"
        >
          {problems.map((problem, idx) => {
            const Icon = problem.icon;
            return (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
