"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export function ImpactSection() {
  const impacts = [
    {
      label: "Pembuatan Surat",
      before: "±30 menit",
      after: "±2 menit"
    },
    {
      label: "Laporan Kas RT",
      before: "±1 jam",
      after: "±2 menit"
    },
    {
      label: "Arsip Surat",
      before: "Buku atau Map",
      after: "Digital"
    },
    {
      label: "Akses Administrasi",
      before: "Harus Bertemu Langsung",
      after: "Website & Android"
    },
    {
      label: "Risiko Kehilangan Data",
      before: "Tinggi",
      after: "Sangat Rendah (Cloud)"
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400 mb-4">
            Dampak Nyata
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Efisiensi yang Tak Tertandingi</h2>
          <p className="text-lg text-muted-foreground">
            Angka waktu di bawah ini adalah hasil pengamatan dan pengukuran langsung penggunaan sistem melalui aplikasi Tata Warga.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="grid grid-cols-3 bg-slate-50 dark:bg-black/40 border-b border-slate-200 dark:border-white/10 p-4 md:p-6 text-center">
              <div className="font-semibold text-slate-500 dark:text-slate-400">Proses</div>
              <div className="font-bold text-red-500">Manual</div>
              <div className="font-bold text-[#6419c1] dark:text-[#a064fa]">Tata Warga</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {impacts.map((impact, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="grid grid-cols-3 p-4 md:p-6 items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="font-medium text-sm md:text-base text-slate-800 dark:text-slate-200">
                    {impact.label}
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <XCircle className="w-5 h-5 text-red-400 mb-2 md:hidden" />
                    <span className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
                      {impact.before}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-2 md:hidden" />
                    <span className="text-sm md:text-base font-bold text-[#6419c1] dark:text-[#a064fa] bg-[#6419c1]/10 px-3 py-1 rounded-full">
                      {impact.after}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
