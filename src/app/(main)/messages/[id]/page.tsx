"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect /messages/:id to /messages?room=:id
 * so all chat happens in the unified split-pane layout.
 */
export default function ChatRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    router.replace(`/messages?room=${id}`);
  }, [id, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF6A3D] border-t-transparent" />
    </div>
  );
}
