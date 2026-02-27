"use client";

import { motion } from "framer-motion";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      <Card className="rounded-2xl border border-border/40 shadow-sm bg-gradient-to-b from-white to-[#f7f8f7] overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center gap-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/8">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </motion.div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>

          {action && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
              className="w-full max-w-xs"
            >
              {action.href ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    asChild
                    className="w-full h-[52px] rounded-[14px] bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <a href={action.href}>
                      {action.label}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={action.onClick}
                    className="w-full h-[52px] rounded-[14px] bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {action.label}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {secondaryAction && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              onClick={secondaryAction.onClick}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {secondaryAction.label}
            </motion.button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
