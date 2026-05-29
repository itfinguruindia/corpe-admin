"use client";

import { Card, Skeleton } from "@heroui/react";

export default function TemplateCardSkeleton() {
  return (
    <Card className="flex h-full min-h-[22rem] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
      <Skeleton className="h-56 w-full shrink-0 rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-2/3 rounded-lg" />
        <div className="mt-auto flex gap-2 pt-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-[2] rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}
