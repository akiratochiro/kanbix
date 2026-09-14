"use client";

import { Trash2 } from "lucide-react";
import type { Card } from "@kanbix/shared-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChecklistItems } from "@/hooks/use-checklist-items";
import { useCreateChecklistItem } from "@/hooks/use-create-checklist-item";
import { useUpdateChecklistItem } from "@/hooks/use-update-checklist-item";
import { useDeleteChecklistItem } from "@/hooks/use-delete-checklist-item";
import { QuickAddForm } from "./quick-add-form";

export function CardChecklist({ card }: { card: Card }) {
  const items = useChecklistItems(card.id);
  const createItem = useCreateChecklistItem(card.id, card.listId);
  const updateItem = useUpdateChecklistItem(card.id, card.listId);
  const deleteItem = useDeleteChecklistItem(card.id, card.listId);

  const progress =
    card.checklist.total > 0
      ? Math.round((card.checklist.completed / card.checklist.total) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Checklist</p>
        {card.checklist.total > 0 && (
          <span className="text-xs text-muted-foreground">
            {card.checklist.completed}/{card.checklist.total}
          </span>
        )}
      </div>

      {card.checklist.total > 0 && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {items.isPending ? (
        <div
          className="mt-2 space-y-1.5"
          role="status"
          aria-label="Carregando checklist"
        >
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      ) : items.isError ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Erro ao carregar o checklist.
        </p>
      ) : (
        <ul className="mt-2 space-y-1">
          {items.data.map((item) => (
            <li key={item.id} className="group flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() =>
                  updateItem.mutate({ itemId: item.id, completed: !item.completed })
                }
                className="size-4 shrink-0 rounded border-input"
                aria-label={item.text}
              />
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.completed && "text-muted-foreground line-through"
                )}
              >
                {item.text}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
                aria-label={`Excluir item ${item.text}`}
                onClick={() => deleteItem.mutate(item.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-1">
        <QuickAddForm
          addLabel="Adicionar item"
          placeholder="Descrição do item"
          onAdd={(text) => createItem.mutateAsync(text)}
        />
      </div>
    </div>
  );
}
