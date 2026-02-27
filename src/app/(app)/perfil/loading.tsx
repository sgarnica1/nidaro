"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function ProfileItemSkeleton() {
  return (
    <Card className="transition-colors hover:bg-muted/50 cursor-pointer rounded-2xl border border-border/40 shadow-sm bg-background">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-md" />
            <div>
              <Skeleton className="h-4 w-32 rounded-md mb-1" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-5 w-5 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PerfilLoading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
      </div>

      <div className="grid gap-3">
        <ProfileItemSkeleton />
        <ProfileItemSkeleton />
        <ProfileItemSkeleton />
        <ProfileItemSkeleton />
      </div>
    </motion.div>
  );
}
