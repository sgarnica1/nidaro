"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncomeForm } from "./income-form";

export function IncomeFAB() {
  return (
    <IncomeForm>
      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </IncomeForm>
  );
}
