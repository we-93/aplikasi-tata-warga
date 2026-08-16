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


      <NotulenClient initialNotulens={serialized} />
    </div>
  );
}
