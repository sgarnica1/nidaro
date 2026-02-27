"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-is-mobile";

type Props = {
  href?: string;
  label?: string;
};

export function MobileBackButton({ href, label = "Atrás" }: Props) {
  const router = useRouter();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  function handleClick() {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="h-9 w-9 -ml-2 mb-4 text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6] md:hidden"
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}
