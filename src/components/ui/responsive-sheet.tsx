"use client";

import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  showDragHandle?: boolean;
};

export function ResponsiveSheet({ open, onOpenChange, title, trigger, children, showDragHandle = true }: Props) {
  const isMobile = useIsMobile();

  const contentClassName = useMemo(
    () =>
      isMobile
        ? "h-[90vh] max-h-[90vh] rounded-t-[24px] rounded-b-none border-none p-0 flex flex-col bg-[#FFFFFF]"
        : "overflow-y-auto w-[400px] sm:w-[440px] px-6 shadow-lg pt-6",
    [isMobile]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        showCloseButton={!isMobile}
        className={cn(contentClassName, !isMobile && "flex flex-col")}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          let element: HTMLElement | null = target;
          while (element && element !== document.documentElement) {
            const slot = element.getAttribute('data-slot');
            if (
              slot === 'combobox-content' ||
              slot === 'combobox-list' ||
              slot === 'combobox-item' ||
              slot === 'combobox-input' ||
              slot === 'input-group' ||
              slot === 'input-group-button'
            ) {
              e.preventDefault();
              return;
            }
            element = element.parentElement;
          }
        }}
        onEscapeKeyDown={() => {
        }}
      >
        {isMobile ? (
          <>
            {showDragHandle && (
              <div className="flex justify-center pt-3 pb-0 shrink-0">
                <div className="w-8 h-1 bg-[#D1D5DB] rounded-full" />
              </div>
            )}
            <SheetHeader className="px-4 pt-5 pb-0 shrink-0 border-none">
              <SheetTitle className="text-[18px] font-bold text-[#111111]">{title}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              {children}
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="mb-4 p-0">
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            {children}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
