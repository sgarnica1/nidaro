"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function ExpenseRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ExpenseGroupSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-3 w-32 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>
      <Card className="rounded-2xl border border-border/40 shadow-sm bg-background">
        <CardContent className="p-0">
          <ExpenseRowSkeleton />
          <div className="border-t border-border/40" />
          <ExpenseRowSkeleton />
          <div className="border-t border-border/40" />
          <ExpenseRowSkeleton />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GastosLoading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-muted/30 min-h-screen">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 px-6 pt-10"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-9 w-32 rounded-md" />
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
              <Skeleton className="h-9 w-32 rounded-md hidden md:block" />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-6"
            >
              <ExpenseGroupSkeleton delay={0.1} />
              <ExpenseGroupSkeleton delay={0.15} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
