"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive"
      onClick={onClick}
      aria-label="Remove"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

export function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} className="gap-1.5">
      <Plus className="size-4" />
      {label}
    </Button>
  );
}

export function MoveButtons({
  onUp,
  onDown,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 text-muted-foreground"
        onClick={onUp}
        disabled={disableUp}
        aria-label="Move up"
      >
        <ChevronUp className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 text-muted-foreground"
        onClick={onDown}
        disabled={disableDown}
        aria-label="Move down"
      >
        <ChevronDown className="size-3.5" />
      </Button>
    </div>
  );
}

export function moveItem<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const target = index + dir;
  if (target < 0 || target >= next.length) return arr;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
