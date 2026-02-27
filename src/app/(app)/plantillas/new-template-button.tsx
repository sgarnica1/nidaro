"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { createTemplate } from "@/lib/actions/templates";

const schema = z.object({ name: z.string().min(1, "El nombre es requerido") });

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewTemplateSheet({ open, onOpenChange }: Props) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "" } });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    } else {
      form.reset();
    }
  }, [open, form]);

  async function onSubmit({ name }: { name: string }) {
    const result = await createTemplate(name);
    if (result.success) {
      onOpenChange(false);
      form.reset();
    }
  }

  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title="Nueva plantilla">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        ref={(e) => {
                          nameInputRef.current = e;
                          field.ref(e);
                        }}
                        placeholder="Nombre de la plantilla"
                        className="h-[52px] bg-[#F8F8F6] border-none rounded-xl px-[14px] text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-[#F3F4F6] px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-sm text-[#6B7280] mb-3 block w-full text-center"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !form.getValues("name")}
              className="w-full h-[52px] text-base font-bold rounded-[14px] bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white disabled:bg-[#9CA3AF] disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {form.formState.isSubmitting ? "Creando..." : "Crear plantilla"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveSheet>
  );
}
