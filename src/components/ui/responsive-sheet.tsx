"use client";

import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
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
};

export function ResponsiveSheet({ open, onOpenChange, title, trigger, children }: Props) {
  const isMobile = useIsMobile();

  const contentClassName = useMemo(
    () =>
      isMobile
        ? "max-h-[85dvh] min-h-[50dvh] overflow-y-auto rounded-t-2xl border-t px-4 pt-6 pb-6 safe-area-inset-bottom"
        : "overflow-y-auto w-[400px] sm:w-[440px] px-6",
    [isMobile]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={contentClassName}
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
          // Don't prevent escape if combobox is open - let it close the combobox first
          // The Sheet will close on the next escape press if combobox is already closed
        }}
      >
        <SheetHeader className="mb-4 p-0 md:pt-4">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
