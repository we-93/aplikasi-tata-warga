"use client";

import { useState, useMemo } from "react";
import { StatistikDashboard } from "@/components/rt/statistik-dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdminStatistikClient({ wargas }: { wargas: any[] }) {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("all");
  const [selectedDesa, setSelectedDesa] = useState<string>("all");

  // Extract unique Kecamatans
  const kecamatans = useMemo(() => {
    const list = new Set<string>();
    wargas.forEach(w => {
      if (w.tenant?.district) list.add(w.tenant.district);
    });
    return Array.from(list).sort();
  }, [wargas]);

  // Extract unique Desas based on selected Kecamatan
  const desas = useMemo(() => {
    const list = new Set<string>();
    wargas.forEach(w => {
      // If a specific kecamatan is selected, only show desas for that kecamatan
      if (selectedKecamatan !== "all" && w.tenant?.district !== selectedKecamatan) return;
      if (w.tenant?.village) list.add(w.tenant.village);
    });
    return Array.from(list).sort();
  }, [wargas, selectedKecamatan]);

  // Handle Kecamatan change
  const handleKecamatanChange = (val: string | null) => {
    if (!val) return;
    setSelectedKecamatan(val);
    setSelectedDesa("all"); // Reset desa filter when kecamatan changes
  };

  // Filter wargas based on selections
  const filteredWargas = useMemo(() => {
    return wargas.filter(w => {
      if (selectedKecamatan !== "all" && w.tenant?.district !== selectedKecamatan) return false;
      if (selectedDesa !== "all" && w.tenant?.village !== selectedDesa) return false;
      return true;
    });
  }, [wargas, selectedKecamatan, selectedDesa]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#141229] border border-slate-200 dark:border-white/5 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="text-sm font-semibold text-slate-500 whitespace-nowrap">Filter Demografi:</div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="w-full sm:w-[250px]">
            <Select value={selectedKecamatan} onValueChange={handleKecamatanChange}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-black/20">
                <SelectValue placeholder="Pilih Kecamatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kecamatan</SelectItem>
                {kecamatans.map(kec => (
                  <SelectItem key={kec} value={kec}>{kec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[250px]">
            <Select value={selectedDesa} onValueChange={(val) => val && setSelectedDesa(val)}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-black/20">
                <SelectValue placeholder="Pilih Desa/Kelurahan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Desa/Kelurahan</SelectItem>
                {desas.map(desa => (
                  <SelectItem key={desa} value={desa}>{desa}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-slate-500 dark:text-white/50 text-right shrink-0">
          Menampilkan <span className="font-bold text-[#6419c1] dark:text-[#a064fa]">{filteredWargas.length}</span> Warga
        </div>
      </div>

      {filteredWargas.length > 0 ? (
        <div className="border border-slate-200 dark:border-white/5 rounded-2xl p-4 bg-white dark:bg-[#141229]">
          <StatistikDashboard wargas={filteredWargas} />
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-black/20 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-500">Tidak Ada Data Warga</h3>
          <p className="text-sm text-slate-400 mt-1">Coba ubah filter Kecamatan atau Desa/Kelurahan Anda.</p>
        </div>
      )}
    </div>
  );
}
