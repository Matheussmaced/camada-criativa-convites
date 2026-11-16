"use client";

import { useOptimistic, useTransition } from "react";
import { toggleProduct } from "../../actions";

export default function ToggleActive({ id, active }: { id: string; active: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(active);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleProduct(id, !optimistic);
        })
      }
      className="flex items-center gap-2 text-xs font-bold text-ink-soft"
    >
      <span className={`relative h-5 w-9 rounded-full transition ${optimistic ? "bg-mint-deep" : "bg-line"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${optimistic ? "left-[18px]" : "left-0.5"}`} />
      </span>
      {optimistic ? "Visível" : "Oculto"}
    </button>
  );
}
