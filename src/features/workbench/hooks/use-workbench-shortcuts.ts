"use client";

import { useEffect } from "react";

type Props = {
  selectedCount: number;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onToggleBypass: () => void;
  onEscape: () => void;
};

export function useWorkbenchShortcuts({
  selectedCount,
  onUndo,
  onRedo,
  onDelete,
  onCopy,
  onPaste,
  onSelectAll,
  onToggleBypass,
  onEscape,
}: Props) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (
        target.matches("input, textarea, select") ||
        target.isContentEditable
      )
        return;

      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (command && key === "z") {
        event.preventDefault();
        if (event.shiftKey) onRedo();
        else onUndo();
      } else if (command && key === "y") {
        event.preventDefault();
        onRedo();
      } else if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedCount
      ) {
        event.preventDefault();
        onDelete();
      } else if (command && key === "c" && selectedCount) {
        event.preventDefault();
        onCopy();
      } else if (command && key === "v") {
        event.preventDefault();
        onPaste();
      } else if (command && key === "a") {
        event.preventDefault();
        onSelectAll();
      } else if (!command && key === "b" && selectedCount) {
        event.preventDefault();
        onToggleBypass();
      } else if (event.key === "Escape") {
        onEscape();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    onCopy,
    onDelete,
    onEscape,
    onPaste,
    onRedo,
    onSelectAll,
    onToggleBypass,
    onUndo,
    selectedCount,
  ]);
}
