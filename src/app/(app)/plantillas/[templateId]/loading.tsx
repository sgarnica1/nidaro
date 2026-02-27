"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function TemplateDetailLoading() {
  return (
    <div className="fixed inset-0 bg-[#F8F8F6] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#F3F4F6] shrink-0 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center -ml-2">
            <ArrowLeft className="h-5 w-5 text-[#6B7280]" />
          </div>
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-20">
        {/* Header Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] p-5 mb-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full mb-2" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Sections Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-12 w-full rounded-xl mb-3" />
              <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden mb-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-4 h-14 px-4">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
                <div className="p-4 border-t border-[#F3F4F6]">
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Button Skeleton */}
        <div className="mt-6">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
