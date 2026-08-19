"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, FileSpreadsheet, ArrowUpRight, ChevronDown, BarChart2 } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { importWargaBulk } from "@/app/actions/warga-excel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function WargaHeaderActions({ wargas }: { wargas: any[] }) {
  const [isImporting, setIsImporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (wargas.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    // Urutkan berdasarkan No KK agar keluarga berkumpul
    const sortedWargas = [...wargas].sort((a, b) => (a.noKk || "").localeCompare(b.noKk || ""));

    const dataToExport = sortedWargas.map((w, index) => ({
      "No": index + 1,
      "NIK": w.nik,
      "No KK": w.noKk || "",
      "Nama Lengkap": w.namaLengkap,
      "Hubungan Keluarga": w.hubunganKeluarga || "LAINNYA",
      "Jenis Kelamin": w.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan",
      "Tempat Lahir": w.tempatLahir || "",
      "Tanggal Lahir": w.tanggalLahir ? new Date(w.tanggalLahir).toISOString().split('T')[0] : "",
      "Agama": w.agama || "",
      "Pendidikan": w.pendidikan || "",
      "Pekerjaan": w.pekerjaan || "",
      "Status Perkawinan": w.statusNikah || "",
      "Golongan Darah": w.golonganDarah || "",
      "No HP": w.noHp || "",
      "Status Warga": w.statusWarga,
      "Alamat": w.alamat || ""
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Warga");
    XLSX.writeFile(wb, `Data_Warga_RT_${new Date().getTime()}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "NIK": "1234567890123456",
        "No KK": "1234567890123450",
        "Nama Lengkap": "Budi Santoso",
        "Hubungan Keluarga": "KEPALA_KELUARGA",
        "Jenis Kelamin": "L",
        "Tempat Lahir": "Jakarta",
        "Tanggal Lahir": "1990-01-01",
        "Agama": "Islam",
        "Pendidikan": "SMA",
        "Pekerjaan": "Pegawai Swasta",
        "Status Perkawinan": "Kawin",
        "Golongan Darah": "O",
        "No HP": "08123456789",
        "Status Warga": "TETAP",
        "Alamat": "Blok A No 1"
      },
      {
        "NIK": "1234567890123457",
        "No KK": "1234567890123450",
        "Nama Lengkap": "Siti Aminah",
        "Hubungan Keluarga": "ISTRI",
        "Jenis Kelamin": "P",
        "Tempat Lahir": "Bandung",
        "Tanggal Lahir": "1992-05-15",
        "Agama": "Islam",
        "Pendidikan": "SMA",
        "Pekerjaan": "Mengurus Rumah Tangga",
        "Status Perkawinan": "Kawin",
        "Golongan Darah": "A",
        "No HP": "08123456788",
        "Status Warga": "TETAP",
        "Alamat": "Blok A No 1"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Warga");
    XLSX.writeFile(wb, `Template_Import_Warga.xlsx`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Map headers back to object keys
      const formattedData = jsonData.map(row => ({
        nik: String(row["NIK"] || row["nik"] || ""),
        noKk: String(row["No KK"] || row["no_kk"] || row["nokk"] || ""),
        namaLengkap: String(row["Nama Lengkap"] || row["nama"] || ""),
        hubunganKeluarga: String(row["Hubungan Keluarga"] || row["hubungan"] || "LAINNYA"),
        jenisKelamin: String(row["Jenis Kelamin"] || row["jk"] || ""),
        tempatLahir: String(row["Tempat Lahir"] || ""),
        tanggalLahir: row["Tanggal Lahir"] || "",
        agama: String(row["Agama"] || ""),
        pendidikan: String(row["Pendidikan"] || ""),
        pekerjaan: String(row["Pekerjaan"] || ""),
        statusNikah: String(row["Status Perkawinan"] || row["status_nikah"] || ""),
        golonganDarah: String(row["Golongan Darah"] || row["gol_darah"] || ""),
        noHp: String(row["No HP"] || row["no_hp"] || ""),
        statusWarga: String(row["Status Warga"] || row["status"] || "TETAP"),
        alamat: String(row["Alamat"] || "")
      })).filter(row => row.nik && row.namaLengkap); // Must have NIK and Nama

      if (formattedData.length === 0) {
        toast.error("Tidak ada data valid yang ditemukan (Pastikan kolom NIK dan Nama terisi).");
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const res = await importWargaBulk(formattedData);
      if (res.success) {
        toast.success(res.message);
        setIsDialogOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal membaca file Excel.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
      <Button variant="outline" className="flex-1 md:flex-none text-xs md:text-sm px-2 md:px-4 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 whitespace-nowrap" onClick={() => setIsDialogOpen(true)}>
        <Upload className="w-4 h-4 mr-1 md:mr-2" /> Import
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data Warga</DialogTitle>
            <DialogDescription>
              Unggah file Excel untuk memasukkan banyak data warga sekaligus. NIK yang sudah ada akan otomatis diperbarui.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Button variant="outline" className="w-full justify-start text-emerald-600 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:text-emerald-700" onClick={handleDownloadTemplate}>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Template Excel
              </Button>
              <p className="text-xs text-muted-foreground ml-1">Unduh template agar kolom data sesuai dengan sistem.</p>
            </div>

            <div className="space-y-2">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                {isImporting ? "Mengimpor..." : "Pilih File & Import"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Link href="/dashboard/rt/warga/create" className="hidden md:flex flex-1 md:flex-none min-w-0">
        <Button className="w-full text-xs md:text-sm px-2 md:px-4 whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-1 md:mr-2" /> Tambah Warga
        </Button>
      </Link>



      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" className="flex-1 md:flex-none text-xs md:text-sm px-2 md:px-4 whitespace-nowrap border-[#6419c1] text-[#6419c1] hover:bg-[#6419c1]/10" type="button">
            <Download className="w-4 h-4 mr-1 md:mr-2" /> Export <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport}>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-[#6419c1]" /> Export Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link href="/dashboard/rt/warga/statistik" className="flex-1 md:flex-none min-w-0">
        <Button className="w-full text-xs md:text-sm px-2 md:px-4 whitespace-nowrap text-black font-semibold hover:opacity-90" style={{ backgroundColor: "#fad900" }}>
          <BarChart2 className="w-4 h-4 mr-1.5" /> Statistik
        </Button>
      </Link>
    </div>
  );
}
