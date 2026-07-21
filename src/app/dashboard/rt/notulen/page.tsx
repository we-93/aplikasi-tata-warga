import { Metadata } from "next";
import { getNotulens } from "@/app/actions/notulen";
import { NotulenClient } from "./client";

export const metadata: Metadata = {
  title: "Notulen AI - Tata Warga",
  description: "Buat notulen rapat RT otomatis dengan kecerdasan buatan"
};

export default async function NotulenPage() {
  const notulens = await getNotulens();

  // Serialize dates for client
  const serialized = notulens.map(n => ({
    ...n,
    tanggalRapat: n.tanggalRapat.toISOString(),
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString()
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1b264f] dark:text-foreground">Notulen AI</h1>
        <p className="text-muted-foreground mt-1">
          Rekam atau ketik hasil rapat, biarkan AI menyusun notulen resminya secara otomatis dan tersimpan di arsip.
        </p>
      </div>

      <NotulenClient initialNotulens={serialized} />
    </div>
  );
}
