"use client";

import { useState } from "react";
import { IncomeList } from "./income-list";
import { IncomeForm } from "./income-form";
import type { SerializedIncomeSource } from "@/lib/actions/income";

type Props = {
  sources: SerializedIncomeSource[];
  totalActive: number;
};

export function IngresosClient({ sources, totalActive }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <IncomeList sources={sources} totalActive={totalActive} onAddIncome={() => setIsFormOpen(true)} />
      {isFormOpen && (
        <IncomeForm open={isFormOpen} onOpenChange={setIsFormOpen}>
          <span className="sr-only">Trigger</span>
        </IncomeForm>
      )}
    </>
  );
}
