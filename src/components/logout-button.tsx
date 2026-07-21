"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}
