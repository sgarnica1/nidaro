"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function ExpenseRowSkeleton({ isFirst, isLast }: { isFirst?: boolean; isLast?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-5 ${isFirst ? "pt-0 pb-4" : isLast ? "pt-4 pb-0" : "py-4"
        }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <Skeleton className="h-4 w-32" />
          {/* <Skeleton className="h-4 w-20" /> */}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          {/* <Skeleton className="h-5 w-20 rounded-full" /> */}
        </div>
      </div>
      <Skeleton className="h-8 w-8 ml-2 shrink-0 rounded-md hidden md:block" />
    </div>
  );
}

export default function GastosLoading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className=""
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md hidden md:block" />
        </div>

        <Skeleton className="h-10 w-[220px] rounded-md" />

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Card className="rounded-2xl border border-border/40 shadow-sm bg-background">
              <CardContent className="p-0">
                <ExpenseRowSkeleton isFirst />
                <Separator />
                <ExpenseRowSkeleton />
                <Separator />
                <ExpenseRowSkeleton isLast />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Card className="rounded-2xl border border-border/40 shadow-sm bg-background">
              <CardContent className="p-0">
                <ExpenseRowSkeleton isFirst />
                <Separator />
                <ExpenseRowSkeleton isLast />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
