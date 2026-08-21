import Link from "next/link";
import { ArrowLeft, Sparkles, MessageSquare } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CreditAIPage() {
  const session = await auth();
  if (!session || !session.user?.tenantId) {
    redirect("/");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { aiChatCredits: true, aiDocCredits: true }
  });

  return (
    <div className="max-w-lg mx-auto pb-6">
      <div className="flex items-center gap-3 pt-2 mb-6">
        <Link href="/dashboard/rt/settings" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#6419c1] dark:text-[#a064fa] truncate">Kredit AI Assistant</h1>
      </div>

      <div className="bg-gradient-to-br from-[#6419c1] to-[#450a8a] p-6 rounded-3xl shadow-lg border border-[#7735d4] my-4 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-[#fad700]" />
          <h3 className="font-bold text-xl">Sisa Kredit Anda</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center backdrop-blur-sm">
            <p className="text-white/80 text-sm font-medium mb-1">Kredit Chat AI</p>
            <p className="text-3xl font-bold">{tenant?.aiChatCredits ?? 0}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center backdrop-blur-sm">
            <p className="text-white/80 text-sm font-medium mb-1">Kredit Notulen</p>
            <p className="text-3xl font-bold">{tenant?.aiDocCredits ?? 0}</p>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 text-sm text-white/80 mb-6 border border-white/10 leading-relaxed">
          Kredit AI digunakan untuk menikmati fitur cerdas seperti tanya jawab interaktif dengan Asisten Virtual dan pembuatan Notulen/Pengumuman otomatis.
        </div>

        <a href="https://api.whatsapp.com/send?phone=6281934197955&text=Halo%20Admin%20Tata%20Warga%2C%20mohon%20dibantu%20untuk%20Top-Up%20Kredit%20AI" target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#fad700] hover:bg-[#fad700]/90 text-black font-bold py-3.5 rounded-xl transition-all shadow-sm text-base">
          <MessageSquare className="w-5 h-5" />
          Topup Kredit AI
        </a>
      </div>
    </div>
  );
}
