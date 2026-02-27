"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function Step3Deductions({ deductions, onDeductionsChange, grossIncome }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [newValue, setNewValue] = useState("");

  const totalDeductions = deductions.reduce((sum, d) => {
    return d.type === "PERCENTAGE" ? sum + (grossIncome * d.value) / 100 : sum + d.value;
  }, 0);

  const availableAfterDeductions = grossIncome - totalDeductions;

  function handleAdd() {
    if (!newName.trim() || !newValue) return;
    const value = parseFloat(newValue);
    if (isNaN(value) || value <= 0) return;

    const newDeduction: Deduction = {
      id: Date.now().toString(),
      name: newName.trim(),
      type: newType,
      value,
    };

    onDeductionsChange([...deductions, newDeduction]);
    setNewName("");
    setNewValue("");
    setNewType("PERCENTAGE");
    setShowForm(false);
  }

  function handleRemove(id: string) {
    onDeductionsChange(deductions.filter((d) => d.id !== id));
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-[26px] font-bold text-[#111111] mb-2">¿Hay deducciones?</h1>
      <p className="text-[15px] text-[#6B7280] mb-8">Agrega deducciones como diezmo o impuestos</p>

      {deductions.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-[15px] text-[#6B7280] mb-2">Sin deducciones</p>
          <p className="text-[13px] text-[#6B7280] mb-6">Toca + para agregar</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="h-12 px-6 rounded-xl bg-[#1C3D2E] text-white font-medium flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Agregar deducción
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-6 space-y-4">
          <p className="text-[15px] font-medium text-[#111111]">Nueva deducción</p>
          <Input
            placeholder="Nombre (ej: Diezmo)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-[52px] bg-[#F8F8F6] border-none rounded-xl px-[14px]"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select value={newType} onValueChange={(v) => setNewType(v as "PERCENTAGE" | "FIXED")}>
              <SelectTrigger className="h-[52px] bg-[#F8F8F6] border-none rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                <SelectItem value="FIXED">Fijo</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder={newType === "PERCENTAGE" ? "10" : "1000"}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="h-[52px] bg-[#F8F8F6] border-none rounded-xl px-[14px]"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim() || !newValue}
              className="flex-1 h-12 rounded-xl bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white"
            >
              Guardar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setNewName("");
                setNewValue("");
              }}
              className="flex-1 h-12 rounded-xl"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {deductions.length > 0 && (
        <div className="space-y-3 mb-6">
          {deductions.map((deduction) => {
            const amount = deduction.type === "PERCENTAGE" 
              ? (grossIncome * deduction.value) / 100 
              : deduction.value;
            
            return (
              <div
                key={deduction.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="text-[15px] font-medium text-[#111111] mb-1">{deduction.name}</div>
                  <div className="text-[13px] text-[#6B7280]">
                    {deduction.type === "PERCENTAGE" ? `${deduction.value}%` : formatCurrency(deduction.value)}
                    {" · "}
                    {formatCurrency(amount)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(deduction.id)}
                  className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {deductions.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] text-[#6B7280]">Ingreso bruto</span>
            <span className="text-[15px] font-medium text-[#111111]">{formatCurrency(grossIncome)}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] text-[#6B7280]">Deducciones</span>
            <span className="text-[15px] font-medium text-[#DC2626]">- {formatCurrency(totalDeductions)}</span>
          </div>
          <div className="h-[1px] bg-[#F3F4F6] mb-3" />
          <div className="flex justify-between items-center">
            <span className="text-[15px] font-bold text-[#111111]">Ingreso disponible</span>
            <span className="text-[15px] font-bold text-[#1C3D2E]">{formatCurrency(availableAfterDeductions)}</span>
          </div>
        </div>
      )}

      {!showForm && deductions.length > 0 && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full h-12 rounded-xl border-2 border-dashed border-[#D1D5DB] text-[#6B7280] font-medium flex items-center justify-center gap-2 hover:border-[#1C3D2E] hover:text-[#1C3D2E] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Agregar otra deducción
        </button>
      )}
    </div>
  );
}
