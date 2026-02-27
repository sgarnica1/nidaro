"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TemplateWithItems } from "@/lib/actions/templates";
import type { ExpenseCategoryWithRelations, BudgetCategoryWithSubs } from "@/lib/actions/expense-categories";
import { EnhancedTemplateCard } from "./enhanced-template-card";
import { TemplateDetailSheet } from "./template-detail-sheet";
import { NewTemplateSheet } from "./new-template-button";
import { TemplateInfoSheet } from "./template-info-sheet";

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
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-semibold text-[#111111]">Plantillas</h1>
          <TemplateInfoSheet />
        </div>
        <Button
          className="hidden md:flex bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white rounded-xl"
          onClick={() => setNewTemplateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva plantilla
        </Button>
      </div>
      <p className="text-[13px] text-[#6B7280] -mt-4">Estructuras de presupuesto reutilizables</p>

      {templates.length === 0 ? (
        <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EAF2EC] mb-4">
            <FileText className="h-8 w-8 text-[#1C3D2E]" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#111111] mb-1">Crea una plantilla</h3>
          <p className="text-[13px] text-[#6B7280] mb-6">
            Guarda tu estructura de gastos para reutilizarla cada mes
          </p>
          <Button
            className="bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white rounded-xl"
            onClick={() => setNewTemplateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva plantilla
          </Button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03, ease: "easeOut" }}
                >
                  <EnhancedTemplateCard
                    template={template}
                    totalIncome={totalIncome}
                    onClick={() => setSelectedTemplateId(template.id)}
                    onUse={() => {
                      // TODO: Navigate to budget creation with template
                      setSelectedTemplateId(template.id);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          {templates.length > 0 && (
            <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-12 text-center mt-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EAF2EC] mb-4">
                <FileText className="h-8 w-8 text-[#1C3D2E]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#111111] mb-1">Crea una plantilla</h3>
              <p className="text-[13px] text-[#6B7280] mb-6">
                Guarda tu estructura de gastos para reutilizarla cada mes
              </p>
              <Button
                className="bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white rounded-xl"
                onClick={() => setNewTemplateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva plantilla
              </Button>
            </div>
          )}

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
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-60 bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white hover:scale-105 transition-all duration-200"
        onClick={() => setNewTemplateOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <NewTemplateSheet open={newTemplateOpen} onOpenChange={setNewTemplateOpen} />
    </div>
  );
}
