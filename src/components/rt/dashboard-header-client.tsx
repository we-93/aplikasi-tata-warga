"use client";

import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface DashboardHeaderClientProps {
  kasData: any[];
}

export function DashboardHeaderClient({ kasData }: DashboardHeaderClientProps) {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Format date like: "10 Agustus 2026"
    const date = new Date();
    const formatted = date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    setCurrentDate(formatted);
  }, []);

  const handleExport = () => {
    try {
      setIsExporting(true);
      if (!kasData || kasData.length === 0) {
        toast.error("Tidak ada data Kas RT untuk diekspor");
        setIsExporting(false);
        return;
      }

      // Format data for Excel
      const excelData = kasData.map(t => ({
        "Tanggal": new Date(t.date).toLocaleDateString("id-ID"),
        "Kategori": t.category,
        "Keterangan": t.description || "-",
        "Tipe": t.type,
        "Nominal (Rp)": Number(t.amount)
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Kas RT");
      
      // Auto-size columns
      const wscols = [
        { wch: 15 },
        { wch: 20 },
        { wch: 40 },
        { wch: 15 },
        { wch: 20 }
      ];
      worksheet["!cols"] = wscols;

      XLSX.writeFile(workbook, `Laporan_Kas_RT_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Laporan berhasil diekspor!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengekspor laporan");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {currentDate && (
        <span className="text-sm font-medium text-slate-500 dark:text-white/50 hidden md:inline-block">
          {currentDate}
        </span>
      )}
      <Button 
        onClick={handleExport} 
        disabled={isExporting}
        className="bg-[#6419c1] hover:bg-[#7735d4] text-white shadow-md shadow-[#6419c1]/20 rounded-xl"
      >
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        Ekspor Laporan
      </Button>
    </div>
  );
}
