"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseList } from "./expense-list";
import { ExpenseForm } from "./expense-form";
import type { ExpenseWithCategory } from "@/lib/actions/expenses";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type BudgetOption = {
  id: string;
  label: string;
};

type Props = {
  expenses: ExpenseWithCategory[];
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetId: string;
  budgetOptions: BudgetOption[];
  selectedBudgetId: string;
  totalReal: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export function GastosClient({ expenses, expenseCategories, budgetId, budgetOptions, selectedBudgetId, totalReal }: Props) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto bg-muted/30 min-h-screen"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Gastos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {formatCurrency(totalReal)}
            </p>
          </div>
          <ExpenseForm
            budgetId={budgetId}
            expenseCategories={expenseCategories}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
          >
            <Button
              variant="default"
              size="sm"
              className="hidden md:flex bg-primary hover:bg-primary/90 hover:scale-[1.02] transition-transform"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo gasto
            </Button>
          </ExpenseForm>
        </motion.div>

        {budgetOptions.length > 1 && (
          <Select
            value={selectedBudgetId}
            onValueChange={(id) => {
              router.push(`/gastos?budgetId=${id}`);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {budgetOptions.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <ExpenseList
          expenses={expenses}
          expenseCategories={expenseCategories}
          budgetId={budgetId}
          onAddExpense={() => setIsFormOpen(true)}
        />

        <ExpenseForm
          budgetId={budgetId}
          expenseCategories={expenseCategories}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
        >
          <Button
            size="icon"
            className="fixed bottom-28 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-[60] bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </ExpenseForm>
      </div>
    </motion.div>
  );
}
