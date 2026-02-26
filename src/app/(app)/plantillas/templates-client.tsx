"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TemplateWithItems } from "@/lib/actions/templates";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";
import { TemplateCompactCard } from "./template-compact-card";
import { TemplateDetailSheet } from "./template-detail-sheet";
import { NewTemplateSheet } from "./new-template-button";

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
        <Button className="hidden md:flex" onClick={() => setNewTemplateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva plantilla
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No tienes plantillas aún.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crea una plantilla para reutilizarla en tus presupuestos mensuales.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateCompactCard
                key={template.id}
                template={template}
                totalIncome={totalIncome}
                onClick={() => setSelectedTemplateId(template.id)}
              />
            ))}
          </div>

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
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40"
        onClick={() => setNewTemplateOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <NewTemplateSheet open={newTemplateOpen} onOpenChange={setNewTemplateOpen} />
    </div>
  );
}
