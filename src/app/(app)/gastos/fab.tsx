"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "./expense-form";
import type { ExpenseCategoryWithRelations } from "@/lib/actions/expense-categories";

type Props = {
  budgetId: string;
  expenseCategories: ExpenseCategoryWithRelations[];
};

export function FAB({ budgetId, expenseCategories }: Props) {
  return (
    <ExpenseForm budgetId={budgetId} expenseCategories={expenseCategories}>
      <motion.div
        className="fixed bottom-24 right-4 md:hidden z-[60]"
        whileTap={{ scale: 0.9 }}
        initial={false}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-primary opacity-20"
          initial={{ scale: 1, opacity: 0 }}
          whileTap={{ scale: 4, opacity: [0, 0.2, 0] }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        <Button
          size="icon"
          className="relative h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </ExpenseForm>
  );
}
