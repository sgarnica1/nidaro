"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  updateCategoryPercentages,
  createBudgetSubcategory,
  deleteBudgetSubcategory,
  type CategoryWithPercentage,
} from "@/lib/actions/budget-structure";
import type { BudgetSubcategory } from "@/generated/prisma/client";

type Props = {
  categories: CategoryWithPercentage[];
};

export function StructureEditor({ categories }: Props) {
  const [percentages, setPercentages] = useState<Record<string, number>>(
    Object.fromEntries(categories.map((c) => [c.id, c.userPercentage]))
  );
  const [localSubs, setLocalSubs] = useState<Record<string, BudgetSubcategory[]>>(
    Object.fromEntries(categories.map((c) => [c.id, c.subcategories]))
  );
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});
  const [savePending, startSave] = useTransition();
  const [subPending, startSub] = useTransition();

  const total = Object.values(percentages).reduce((sum, v) => sum + v, 0);
  const isValid = Math.abs(total - 100) <= 0.01;

  function handleSave() {
    startSave(async () => {
      const data = Object.entries(percentages).map(([categoryId, percentage]) => ({
        categoryId,
        percentage,
      }));
      const result = await updateCategoryPercentages(data);
      if (result.success) {
      } else {
      }
    });
  }

  function handleAddSubcategory(categoryId: string) {
    const name = newSubName[categoryId]?.trim();
    if (!name) return;
    startSub(async () => {
      const result = await createBudgetSubcategory(categoryId, name);
      if (result.success) {
        setLocalSubs((prev) => ({
          ...prev,
          [categoryId]: [...(prev[categoryId] ?? []), result.data],
        }));
        setNewSubName((prev) => ({ ...prev, [categoryId]: "" }));
      } else {
      }
    });
  }

  function handleDeleteSubcategory(categoryId: string, subId: string) {
    startSub(async () => {
      const result = await deleteBudgetSubcategory(subId);
      if (result.success) {
        setLocalSubs((prev) => ({
          ...prev,
          [categoryId]: prev[categoryId].filter((s) => s.id !== subId),
        }));
      } else {
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">Total asignado:</p>
        <Badge variant={isValid ? "default" : "destructive"} className="text-sm">
          {total.toFixed(0)}%
        </Badge>
        {!isValid && (
          <p className="text-sm text-destructive">Debe sumar exactamente 100%</p>
        )}
      </div>

      <div className="space-y-4">
        {categories.map((cat) => {
          const subs = localSubs[cat.id] ?? [];
          const expanded = expandedSubs[cat.id] ?? false;

          return (
            <Card key={cat.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{cat.name}</span>
                  <span className="text-2xl font-semibold text-primary">
                    {percentages[cat.id]}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Slider
                  value={[percentages[cat.id]]}
                  onValueChange={([v]) =>
                    setPercentages((prev) => ({ ...prev, [cat.id]: v }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Predeterminado: {Number(cat.defaultPercentage)}%
                </p>

                <Separator />

                {/* Subcategories */}
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() =>
                      setExpandedSubs((prev) => ({
                        ...prev,
                        [cat.id]: !prev[cat.id],
                      }))
                    }
                  >
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    Subcategorías ({subs.length})
                  </button>

                  {expanded && (
                    <div className="mt-3 space-y-2">
                      {subs.length === 0 && (
                        <p className="text-xs text-muted-foreground">Sin subcategorías.</p>
                      )}
                      {subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between py-1 px-2 rounded-md bg-muted/50"
                        >
                          <span className="text-sm">{sub.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={subPending}
                            onClick={() => handleDeleteSubcategory(cat.id, sub.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ))}

                      <div className="flex gap-2 pt-1">
                        <Input
                          placeholder="Nueva subcategoría..."
                          value={newSubName[cat.id] ?? ""}
                          onChange={(e) =>
                            setNewSubName((prev) => ({
                              ...prev,
                              [cat.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSubcategory(cat.id);
                            }
                          }}
                          disabled={subPending}
                          className="h-8 text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0"
                          disabled={subPending || !newSubName[cat.id]?.trim()}
                          onClick={() => handleAddSubcategory(cat.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button onClick={handleSave} disabled={!isValid || savePending} className="w-full">
        {savePending ? "Guardando..." : "Guardar estructura"}
      </Button>
    </div>
  );
}
