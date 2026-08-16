"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteRtTemplate } from "@/app/actions/letter";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import Link from "next/link";

type TemplateData = {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
};

export function RtLetterList({ templates }: { templates: TemplateData[] }) {
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) return;
    
    const res = await deleteRtTemplate(id);
    if (res.success) {
      toast.success("Template dihapus.");
    } else {
      toast.error(res.error);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/dashboard/rt/surat/template/create">
          <button className="flex items-center gap-2 bg-[#6419c1] text-white px-5 py-2.5 rounded-xl shadow-md shadow-[#6419c1]/20 dark:shadow-[0_0_15px_rgba(100,25,193,0.4)] hover:bg-[#7735d4] transition-all text-sm font-semibold">
            <Plus className="w-4 h-4" />
            Tambah Template Kustom
          </button>
        </Link>
      </div>

      <div className="bg-white dark:bg-[#141229] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_0_15px_rgba(100,25,193,0.1)] overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Template</h4>
        </div>
        <div className="overflow-x-auto w-full pb-2">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">NAMA SURAT</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">KODE</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">TANGGAL DIBUAT</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 dark:text-white/40 text-sm">
                    Belum ada master template surat.
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.id} className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-sm text-slate-900 dark:text-white">{t.name}</td>
                    <td className="px-6 py-4">
                      <code className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-[#6419c1] dark:text-[#a064fa] rounded-lg text-[11px] font-bold border border-slate-200 dark:border-white/10">{t.code}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/60">{new Date(t.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/rt/surat/template/${t.id}/edit`}>
                          <button 
                            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Link>

                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
