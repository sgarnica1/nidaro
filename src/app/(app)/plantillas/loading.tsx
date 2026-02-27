"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function TemplateSkeletonCard() {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow gap-1 rounded-2xl border border-border/40 shadow-sm bg-background">
      <CardHeader>
        <Skeleton className="h-6 w-24 rounded-md" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-8 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlantillasLoading() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TemplateSkeletonCard />
        <TemplateSkeletonCard />
        <TemplateSkeletonCard />
        <TemplateSkeletonCard />
        <TemplateSkeletonCard />
        <TemplateSkeletonCard />
      </div>
    </motion.div>
  );
}
