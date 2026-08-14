import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProducts, getInvoices } from "@/app/actions/customer";
import prisma from "@/lib/prisma";
import { BillingClient } from "./client";

export default async function AdminBillingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  const [products, invoices, settings] = await Promise.all([
    getProducts(),
    getInvoices(),
    prisma.siteSettings.findFirst()
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full text-slate-900 dark:text-white">
      <BillingClient 
        initialProducts={products} 
        initialInvoices={invoices} 
        settings={settings}
      />
    </div>
  );
}
