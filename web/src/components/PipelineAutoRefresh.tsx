"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Soft-refresh while the pipeline is in an automatic processing status. */
export default function PipelineAutoRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      router.refresh();
    }, 4000);
    return () => clearInterval(id);
  }, [active, router]);

  return null;
}
