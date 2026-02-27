"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function TemplateSkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
    >
      <Card className="rounded-2xl bg-background shadow-sm p-4">
        <CardHeader className="p-0 pb-3">
          <Skeleton className="h-5 w-24 rounded-md" />
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-8 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PlantillasLoading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto px-5 py-6 bg-muted/20 min-h-screen">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-32 rounded-md" />
                <Skeleton className="h-4 w-48 rounded-md" />
              </div>
              <Skeleton className="h-9 w-36 rounded-md hidden md:block" />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <TemplateSkeletonCard key={index} delay={0.1 + index * 0.05} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
