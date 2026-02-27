"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CategoryItemSkeleton() {
  return (
    <Card className="rounded-2xl border border-border/40 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CategoriasLoading() {
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

            <Tabs defaultValue="necesidades" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="necesidades" disabled>
                  <Skeleton className="h-4 w-24 rounded-md" />
                </TabsTrigger>
                <TabsTrigger value="gustos" disabled>
                  <Skeleton className="h-4 w-16 rounded-md" />
                </TabsTrigger>
                <TabsTrigger value="ahorro" disabled>
                  <Skeleton className="h-4 w-20 rounded-md" />
                </TabsTrigger>
              </TabsList>
              <TabsContent value="necesidades" className="space-y-3 mt-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <CategoryItemSkeleton />
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
