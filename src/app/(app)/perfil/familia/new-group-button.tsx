"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import { createFamilyGroup } from "@/lib/actions/family";

const schema = z.object({ name: z.string().min(1, "El nombre es requerido") });

export function NewGroupButton() {
  const [open, setOpen] = useState(false);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "" } });

  async function onSubmit({ name }: { name: string }) {
    const result = await createFamilyGroup(name);
    if (result.success) {
      toast.success("Grupo creado");
      setOpen(false);
      form.reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <Button className="hidden md:flex" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo grupo
      </Button>

      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <ResponsiveSheet open={open} onOpenChange={setOpen} title="Crear grupo familiar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Familia García..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </form>
        </Form>
      </ResponsiveSheet>
    </>
  );
}
