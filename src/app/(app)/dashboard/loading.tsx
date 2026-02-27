"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-9 w-48 rounded-md" />
                <Skeleton className="h-4 w-56 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-36 rounded-md hidden md:block" />
                <Skeleton className="h-9 w-36 rounded-md hidden md:block" />
              </div>
            </div>

            <Skeleton className="h-10 w-48 rounded-md" />

            <Card className="p-6 rounded-2xl border border-border/40 shadow-sm bg-background">
              <Skeleton className="h-4 w-32 rounded-md mb-2" />
              <Skeleton className="h-10 w-48 rounded-md" />
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-2xl border border-border/40 shadow-sm bg-background">
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-20 rounded-md mb-2" />
                    <Skeleton className="h-7 w-32 rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-2xl border border-border/40 shadow-sm p-6 bg-background">
              <Skeleton className="h-6 w-32 rounded-md mb-4" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </Card>

            <div className="min-h-[400px]">
              <Skeleton className="h-full w-full rounded-2xl" />
            </div>
      </motion.div>
    </div>
  );
}
