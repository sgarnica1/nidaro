"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BookTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TemplateWithItems } from "@/lib/actions/templates";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";
import { TemplateCompactCard } from "./template-compact-card";
import { TemplateDetailSheet } from "./template-detail-sheet";
import { NewTemplateSheet } from "./new-template-button";
import { EmptyState } from "@/components/ui/empty-state";

type Props = {
  templates: TemplateWithItems[];
  expenseCategories: ExpenseCategoryWithRelations[];
  budgetCategories: BudgetCategoryWithSubs[];
  totalIncome: number;
};

export function TemplatesClient({ templates, expenseCategories, budgetCategories, totalIncome }: Props) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Plantillas</h1>
          <p className="text-sm text-muted-foreground">Estructuras de presupuesto reutilizables</p>
        </div>
        <Button className="hidden md:flex bg-primary hover:bg-primary/90" onClick={() => setNewTemplateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva plantilla
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={BookTemplate}
          title="Crea tu primera plantilla"
          description="Guarda estructuras de presupuesto reutilizables para ahorrar tiempo al crear nuevos presupuestos mensuales."
          action={{
            label: "Crear plantilla",
            onClick: () => setNewTemplateOpen(true),
          }}
        />
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03, ease: "easeOut" }}
                >
                  <TemplateCompactCard
                    template={template}
                    totalIncome={totalIncome}
                    onClick={() => setSelectedTemplateId(template.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <TemplateDetailSheet
            template={selectedTemplate}
            expenseCategories={expenseCategories}
            budgetCategories={budgetCategories}
            totalIncome={totalIncome}
            open={selectedTemplateId !== null}
            onOpenChange={(open) => {
              if (!open) setSelectedTemplateId(null);
            }}
          />
        </>
      )}

      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-[60] bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
        onClick={() => setNewTemplateOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <NewTemplateSheet open={newTemplateOpen} onOpenChange={setNewTemplateOpen} />
    </div>
  );
}
