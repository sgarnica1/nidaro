"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function NewBudgetFAB() {
  const router = useRouter();

  return (
    <motion.div
      className="fixed bottom-24 right-4 md:hidden z-40"
      whileTap={{ scale: 0.9 }}
      initial={false}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-[#1C3D2E] opacity-20"
        initial={{ scale: 1, opacity: 0 }}
        whileTap={{ scale: 4, opacity: [0, 0.2, 0] }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <Button
        size="icon"
        onClick={() => router.push("/presupuestos/nuevo")}
        className="relative h-14 w-14 rounded-full shadow-lg bg-[#1C3D2E] hover:bg-[#1C3D2E]/90 text-white"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </motion.div>
  );
}
