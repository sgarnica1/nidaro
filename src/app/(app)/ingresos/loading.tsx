"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function IncomeItemSkeleton() {
  return (
    <Card className="rounded-2xl border border-border/40 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IngresosLoading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
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

            <Card>
              <CardContent className="py-4">
                <Skeleton className="h-4 w-32 rounded-md mb-2" />
                <Skeleton className="h-9 w-40 rounded-md" />
              </CardContent>
            </Card>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <IncomeItemSkeleton />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
