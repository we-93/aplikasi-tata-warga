"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Detects if running inside Capacitor (Android APK) and redirects to login/dashboard.
 * This prevents the landing page from showing in the APK.
 */
export function CapacitorRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if running in Capacitor (Android/iOS APK)
    const isCapacitor =
      typeof (window as any).Capacitor !== "undefined" ||
      navigator.userAgent.includes("capacitor") ||
      window.location.protocol === "capacitor:";

    if (isCapacitor) {
      // Check auth via a quick API call
      fetch("/api/auth/session")
        .then(r => r.json())
        .then(session => {
          if (session?.user) {
            router.replace("/dashboard/rt");
          } else {
            router.replace("/auth/login");
          }
        })
        .catch(() => {
          router.replace("/auth/login");
        });
    }
  }, [router]);

  return null;
}
