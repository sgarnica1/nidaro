"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateCategoryPercentages, type CategoryWithPercentage } from "@/lib/actions/budget-structure";

type Props = {
  categories: CategoryWithPercentage[];
};

export function StructureEditor({ categories }: Props) {
  const [percentages, setPercentages] = useState<Record<string, number>>(
    Object.fromEntries(categories.map((c) => [c.id, c.userPercentage]))
  );
  const [pending, startTransition] = useTransition();

  const total = Object.values(percentages).reduce((sum, v) => sum + v, 0);
  const isValid = Math.abs(total - 100) <= 0.01;

  function handleChange(id: string, value: number) {
    setPercentages((prev) => ({ ...prev, [id]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const data = Object.entries(percentages).map(([categoryId, percentage]) => ({
        categoryId,
        percentage,
      }));
      const result = await updateCategoryPercentages(data);
      if (result.success) {
        toast.success("Estructura actualizada");
      } else {
        toast.error(result.error);
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
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{cat.name}</span>
                <span className="text-2xl font-semibold text-primary">
                  {percentages[cat.id]}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Slider
                value={[percentages[cat.id]]}
                onValueChange={([v]) => handleChange(cat.id, v)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Predeterminado: {Number(cat.defaultPercentage)}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} disabled={!isValid || pending} className="w-full">
        {pending ? "Guardando..." : "Guardar estructura"}
      </Button>
    </div>
  );
}
