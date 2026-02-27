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
          "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-[60] bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200",
          isFormOpen && "hidden"
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </IncomeForm>
  );
}
