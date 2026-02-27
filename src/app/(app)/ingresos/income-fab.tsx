"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncomeForm } from "./income-form";
import { cn } from "@/lib/utils";

export function IncomeFAB() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <IncomeForm open={isFormOpen} onOpenChange={setIsFormOpen}>
      <Button
        size="icon"
        className={cn(
          "fixed bottom-24 right-5 h-14 w-14 rounded-full md:hidden z-[60] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white shadow-[0_4px_16px_rgba(28,61,46,0.35)] transition-opacity active:opacity-75",
          isFormOpen && "hidden"
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </IncomeForm>
  );
}
