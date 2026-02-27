"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
          <div className="space-y-4 flex-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Base Mensual..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="sticky bottom-0 bg-background border-t pt-4 pb-4 -mx-4 px-4 mt-auto">
            <Button type="submit" className="w-full h-12 text-base" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveSheet>
  );
}
