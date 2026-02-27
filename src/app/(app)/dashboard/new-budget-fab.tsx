"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NewBudgetFAB() {
  const router = useRouter();

  return (
    <Button
      size="icon"
      onClick={() => router.push("/presupuestos/nuevo")}
      className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40 bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white hover:scale-105 transition-all duration-200"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
