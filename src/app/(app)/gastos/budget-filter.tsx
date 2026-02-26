"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BudgetOption = {
  id: string;
  label: string;
};

type Props = {
  budgets: BudgetOption[];
  selectedId: string;
};

export function BudgetFilter({ budgets, selectedId }: Props) {
  const router = useRouter();

  if (budgets.length <= 1) return null;

  return (
    <Select value={selectedId} onValueChange={(id) => router.push(`/gastos?budgetId=${id}`)}>
      <SelectTrigger className="w-full sm:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {budgets.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
