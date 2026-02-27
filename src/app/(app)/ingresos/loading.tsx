"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function IncomeItemSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton className="h-6 w-11 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-32 mb-1 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function IngresosLoading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md hidden md:block" />
      </div>

      <Card className="rounded-2xl border border-border/40 shadow-sm bg-background">
        <CardContent className="py-4">
          <Skeleton className="h-4 w-32 rounded-md mb-2" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </CardContent>
      </Card>

      <div className="divide-y rounded-lg border overflow-hidden">
        <IncomeItemSkeleton />
        <IncomeItemSkeleton />
        <IncomeItemSkeleton />
      </div>
    </motion.div>
  );
}
