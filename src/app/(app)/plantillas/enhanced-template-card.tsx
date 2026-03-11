"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GripVertical, Plus, Copy, MoreVertical, FileEdit, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { duplicateTemplate, updateTemplate, deleteTemplate } from "@/lib/actions/templates";
import { cn } from "@/lib/utils";
import type { TemplateWithItems } from "@/lib/actions/templates";

type Props = {
  template: TemplateWithItems;
  totalIncome: number;
  onClick: () => void;
  onUse: () => void;
  onDuplicate?: () => void;
  lastUsed?: string | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const CATEGORY_COLORS: Record<string, string> = {
  Necesidades: "#3B82F6",
  Gustos: "#F59E0B",
  Ahorro: "#10B981",
};

export function EnhancedTemplateCard({ template, totalIncome, onClick, onUse, onDuplicate, lastUsed }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);
  const [duplicateSheetOpen, setDuplicateSheetOpen] = useState(false);
  const [renameSheetOpen, setRenameSheetOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const totalPlanned = template.items.reduce((sum, i) => sum + Number(i.plannedAmount), 0);
  const percentOfIncome = totalIncome > 0 ? ((totalPlanned / totalIncome) * 100).toFixed(1) : "—";
  const itemCount = template.items.length;

  const categoryTotals: Record<string, number> = {};
  template.items.forEach((item) => {
    const catName = item.expenseCategory.budgetCategory.name;
    categoryTotals[catName] = (categoryTotals[catName] ?? 0) + Number(item.plannedAmount);
  });

  const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  const categoryPercentages: Record<string, number> = {};
  Object.entries(categoryTotals).forEach(([name, amount]) => {
    categoryPercentages[name] = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
  });

  const categories = Object.keys(categoryTotals).sort((a, b) => {
    const order = ["Necesidades", "Gustos", "Ahorro"];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  function handleDuplicate() {
    setActionsSheetOpen(false);
    setDuplicateName(`${template.name} (Copia)`);
    setDuplicateSheetOpen(true);
  }

  function handleRename() {
    setActionsSheetOpen(false);
    setRenameValue(template.name);
    setRenameSheetOpen(true);
  }

  function handleDelete() {
    setActionsSheetOpen(false);
    setDeleteSheetOpen(true);
  }

  function handleConfirmDuplicate() {
    if (!duplicateName.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setDuplicateSheetOpen(false);
    startTransition(async () => {
      const result = await duplicateTemplate(template.id, duplicateName.trim());
      if (result.success) {
        setDuplicateName("");
        router.refresh();
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      } else {
        toast.error(result.error || "Error al duplicar la plantilla");
      }
    });
  }

  function handleConfirmRename() {
    if (!renameValue.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    if (renameValue.trim() === template.name) {
      setRenameSheetOpen(false);
      return;
    }
    setRenameSheetOpen(false);
    startTransition(async () => {
      const result = await updateTemplate(template.id, renameValue.trim());
      if (result.success) {
        setRenameValue("");
        router.refresh();
      } else {
        toast.error(result.error || "Error al renombrar la plantilla");
      }
    });
  }

  function handleConfirmDelete() {
    setDeleteSheetOpen(false);
    startTransition(async () => {
      const result = await deleteTemplate(template.id);
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error || "Error al eliminar la plantilla");
      }
    });
  }

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
      >
        <Card
          className="rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-md transition-all"
          onClick={onClick}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-[18px] font-bold text-[#111111] mb-1">{template.name}</h3>
                <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                  <span>{itemCount} gastos</span>
                  {totalIncome > 0 && <span>· {percentOfIncome}% del ingreso</span>}
                </div>
                {lastUsed && (
                  <p className="text-[12px] text-[#6B7280] mt-1">Última vez usada: {lastUsed}</p>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActionsSheetOpen(true);
                }}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#F3F4F6] transition-colors shrink-0 ml-2"
              >
                <MoreVertical className="h-5 w-5 text-[#6B7280]" />
              </motion.button>
            </div>

            {categories.length > 0 && (
              <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mb-4">
                <div className="h-full flex">
                  {categories.map((catName) => {
                    const pct = categoryPercentages[catName] ?? 0;
                    return (
                      <div
                        key={catName}
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: CATEGORY_COLORS[catName] || "#6B7280",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[20px] font-bold text-[#111111]">{formatCurrency(totalPlanned)}</p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="h-9 px-4 rounded-xl bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white text-[13px] font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUse();
                  }}
                >
                  Agregar gastos
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions Sheet */}
      <ResponsiveSheet open={actionsSheetOpen} onOpenChange={setActionsSheetOpen} title={template.name}>
        <div className="px-6 pb-6 space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDuplicate}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-[#F3F4F6] transition-colors text-left"
          >
            <Copy className="h-5 w-5 text-[#6B7280]" />
            <span className="text-[15px] font-medium text-[#111111]">Duplicar plantilla</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleRename}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-[#F3F4F6] transition-colors text-left"
          >
            <FileEdit className="h-5 w-5 text-[#6B7280]" />
            <span className="text-[15px] font-medium text-[#111111]">Renombrar plantilla</span>
          </motion.button>
          <Separator className="my-2" />
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-[#FEE2E2] transition-colors text-left"
          >
            <Trash2 className="h-5 w-5 text-[#DC2626]" />
            <span className="text-[15px] font-medium text-[#DC2626]">Eliminar plantilla</span>
          </motion.button>
        </div>
        <div className="px-6 pb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActionsSheetOpen(false)}
            className="w-full h-12 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors text-[15px] font-medium text-[#111111]"
          >
            Cancelar
          </motion.button>
        </div>
      </ResponsiveSheet>

      {/* Duplicate Sheet */}
      <ResponsiveSheet open={duplicateSheetOpen} onOpenChange={setDuplicateSheetOpen} title="Duplicar plantilla">
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-[#111111]">Nombre de la plantilla</label>
            <Input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="Nombre de la plantilla"
              className="h-12 text-[15px]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmDuplicate();
                }
              }}
            />
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setDuplicateSheetOpen(false)}
              className="flex-1 h-12 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors text-[15px] font-medium text-[#111111]"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleConfirmDuplicate}
              disabled={pending || !duplicateName.trim()}
              className="flex-1 h-12 rounded-xl bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white transition-colors text-[15px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear duplicado
            </motion.button>
          </div>
        </div>
      </ResponsiveSheet>

      {/* Rename Sheet */}
      <ResponsiveSheet open={renameSheetOpen} onOpenChange={setRenameSheetOpen} title="Renombrar plantilla">
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-[#111111]">Nombre de la plantilla</label>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Nombre de la plantilla"
              className="h-12 text-[15px]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmRename();
                }
              }}
            />
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setRenameSheetOpen(false)}
              className="flex-1 h-12 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors text-[15px] font-medium text-[#111111]"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleConfirmRename}
              disabled={pending || !renameValue.trim()}
              className="flex-1 h-12 rounded-xl bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white transition-colors text-[15px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </motion.button>
          </div>
        </div>
      </ResponsiveSheet>

      {/* Delete Sheet */}
      <ResponsiveSheet open={deleteSheetOpen} onOpenChange={setDeleteSheetOpen} title="Eliminar plantilla">
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-3">
            <p className="text-[15px] text-[#111111]">
              ¿Estás seguro de que quieres eliminar esta plantilla?
            </p>
            <div className="p-4 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl">
              <p className="text-[14px] font-medium text-[#92400E]">
                &quot;{template.name}&quot;
              </p>
            </div>
            <p className="text-[13px] text-[#DC2626] font-medium">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setDeleteSheetOpen(false)}
              className="flex-1 h-12 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors text-[15px] font-medium text-[#111111]"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleConfirmDelete}
              disabled={pending}
              className="flex-1 h-12 rounded-xl bg-[#DC2626] hover:bg-[#DC2626]/90 text-white transition-colors text-[15px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar plantilla
            </motion.button>
          </div>
        </div>
      </ResponsiveSheet>
    </>
  );
}
