"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Surat Detail Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50/50 rounded-2xl border border-red-100 dark:bg-red-950/20 dark:border-red-900/50">
      <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
        Oops! Terjadi Kesalahan
      </h2>
      <div className="bg-white dark:bg-black p-4 rounded-md shadow-sm border border-red-200 dark:border-red-800 text-left w-full max-w-2xl mb-6 overflow-auto">
        <p className="text-sm font-mono text-red-600 dark:text-red-400 break-words">
          {error.message || "Unknown error occurred"}
        </p>
        {error.stack && (
          <pre className="text-xs font-mono text-slate-500 mt-2 whitespace-pre-wrap break-words">
            {error.stack}
          </pre>
        )}
      </div>
      <Button onClick={() => reset()} variant="outline">
        Coba Lagi
      </Button>
    </div>
  );
}
