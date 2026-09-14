"use client";

import { useRef, useState } from "react";
import { useUpdateList } from "@/hooks/use-update-list";

export function ListTitle({
  listId,
  boardId,
  name,
}: {
  listId: string;
  boardId: string;
  name: string;
}) {
  const updateList = useUpdateList(boardId);
  const [isEditing, setIsEditing] = useState(false);
  // Enter salva (via blur), Escape cancela sem salvar — os dois disparam
  // blur pra sair do modo de edição, então essa ref diferencia o motivo.
  const cancelledRef = useRef(false);

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    setIsEditing(false);
    if (cancelledRef.current) return;

    const trimmed = event.target.value.trim();
    if (trimmed && trimmed !== name) {
      updateList.mutate({ listId, name: trimmed });
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      cancelledRef.current = true;
      event.currentTarget.blur();
    }
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        defaultValue={name}
        maxLength={100}
        aria-label="Nome da lista"
        className="h-6 w-full min-w-0 rounded border border-input bg-background px-1 text-sm font-medium outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={(event) => event.target.select()}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        cancelledRef.current = false;
        setIsEditing(true);
      }}
      className="truncate rounded px-1 text-left text-sm font-medium hover:bg-background/60"
    >
      {name}
    </button>
  );
}
