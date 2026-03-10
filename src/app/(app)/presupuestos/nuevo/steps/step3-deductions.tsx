"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Deduction = {
  id: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
};

type Props = {
  deductions: Deduction[];
  onDeductionsChange: (deductions: Deduction[]) => void;
  grossIncome: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const PRESETS = [
  { name: "Diezmo", type: "PERCENTAGE" as const, value: 10 },
  { name: "Impuestos", type: "PERCENTAGE" as const, value: 20 },
  { name: "Ahorro", type: "PERCENTAGE" as const, value: 10 },
  { name: "Inversión", type: "PERCENTAGE" as const, value: 15 },
];

export function Step3Deductions({ deductions, onDeductionsChange, grossIncome }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [newValue, setNewValue] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const totalDeductions = deductions.reduce((sum, d) => {
    return d.type === "PERCENTAGE" ? sum + (grossIncome * d.value) / 100 : sum + d.value;
  }, 0);

  const availableAfterDeductions = grossIncome - totalDeductions;

  useEffect(() => {
    if (showForm || editingId) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [showForm, editingId]);

  function handlePreset(preset: typeof PRESETS[0]) {
    setNewName(preset.name);
    setNewType(preset.type);
    setNewValue(preset.value.toString());
    setShowForm(true);
    setEditingId(null);
  }

  function handleSave() {
    if (!newName.trim() || !newValue) return;
    const value = parseFloat(newValue);
    if (isNaN(value) || value <= 0) return;

    const deduction: Deduction = {
      id: editingId || Date.now().toString(),
      name: newName.trim(),
      type: newType,
      value,
    };

    if (editingId) {
      onDeductionsChange(deductions.map((d) => (d.id === editingId ? deduction : d)));
    } else {
      onDeductionsChange([...deductions, deduction]);
    }

    handleCancel();
  }

  function handleCancel() {
    setNewName("");
    setNewValue("");
    setNewType("PERCENTAGE");
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(deduction: Deduction) {
    setNewName(deduction.name);
    setNewType(deduction.type);
    setNewValue(deduction.value.toString());
    setEditingId(deduction.id);
    setShowForm(true);
  }

  function handleRemove(id: string) {
    onDeductionsChange(deductions.filter((d) => d.id !== id));
  }

  const currentDeductionAmount = newValue
    ? newType === "PERCENTAGE"
      ? (grossIncome * parseFloat(newValue || "0")) / 100
      : parseFloat(newValue || "0")
    : 0;

  return (
    <div className="px-4 pt-6 pb-8">
      <div className="mb-2">
        <p className="text-xs text-muted-foreground mb-1">Paso 3 de 4</p>
        <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2">Deducciones</h1>
        <p className="text-sm text-muted-foreground">
          Antes de asignar tu dinero, puedes separar una parte automáticamente.
          <br />
          Ej: diezmo, impuestos o ahorro.
        </p>
      </div>

      {/* Quick Presets */}
      {!showForm && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {PRESETS.map((preset) => (
            <motion.button
              key={preset.name}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePreset(preset)}
              className="rounded-full px-4 py-2 text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/70 transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              {preset.name} {preset.value}%
            </motion.button>
          ))}
        </div>
      )}

      {/* New/Edit Deduction Card */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6"
        >
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                {editingId ? "Editar deducción" : "Nueva deducción"}
              </h3>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nombre</label>
                <Input
                  ref={nameInputRef}
                  placeholder="Ej: Diezmo"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    // Smart suggestions
                    const lower = e.target.value.toLowerCase();
                    if (lower.includes("diezmo")) {
                      setNewType("PERCENTAGE");
                      setNewValue("10");
                    } else if (lower.includes("impuesto")) {
                      setNewType("PERCENTAGE");
                      setNewValue("20");
                    }
                  }}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Tipo</label>
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setNewType("PERCENTAGE")}
                    className={cn(
                      "flex-1 h-9 rounded-md text-sm font-medium transition-colors",
                      newType === "PERCENTAGE"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    )}
                  >
                    % Porcentaje
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("FIXED")}
                    className={cn(
                      "flex-1 h-9 rounded-md text-sm font-medium transition-colors",
                      newType === "FIXED"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    )}
                  >
                    $ Monto
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {newType === "PERCENTAGE" ? "Porcentaje" : "Monto fijo"}
                </label>
                <Input
                  type="number"
                  step={newType === "PERCENTAGE" ? "0.1" : "0.01"}
                  min="0"
                  placeholder={newType === "PERCENTAGE" ? "10" : "1000"}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Real-time Preview */}
              {newValue && parseFloat(newValue) > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3"
                >
                  De un ingreso de {formatCurrency(grossIncome)}
                  <br />
                  Se separarán{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(currentDeductionAmount)}
                  </span>
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!newName.trim() || !newValue || parseFloat(newValue) <= 0}
                  className="flex-1 h-11 rounded-xl"
                >
                  Guardar deducción
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Added Deductions List */}
      {deductions.length > 0 && (
        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {deductions.map((deduction) => {
              const amount = deduction.type === "PERCENTAGE" 
                ? (grossIncome * deduction.value) / 100 
                : deduction.value;
              
              return (
                <motion.div
                  key={deduction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group"
                >
                  <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-base font-medium text-foreground mb-1">
                          {deduction.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {deduction.type === "PERCENTAGE" 
                            ? `${deduction.value}%` 
                            : formatCurrency(deduction.value)}
                          {" · "}
                          {formatCurrency(amount)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(deduction)}
                          className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(deduction.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Summary Card */}
      {deductions.length > 0 && (
        <Card className="rounded-xl shadow-sm mb-6">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ingreso bruto</span>
              <span className="text-base font-medium text-foreground">{formatCurrency(grossIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Deducciones</span>
              <span className="text-base font-medium text-destructive">- {formatCurrency(totalDeductions)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-foreground">Ingreso disponible</span>
              <span className="text-base font-semibold text-primary">{formatCurrency(availableAfterDeductions)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Another Button */}
      {!showForm && deductions.length > 0 && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="w-full h-11 rounded-xl border-2 border-dashed border-border text-muted-foreground font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar otra deducción
        </motion.button>
      )}

      {/* Empty State */}
      {deductions.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground mb-4">No hay deducciones configuradas</p>
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar deducción
          </Button>
        </div>
      )}
    </div>
  );
}
