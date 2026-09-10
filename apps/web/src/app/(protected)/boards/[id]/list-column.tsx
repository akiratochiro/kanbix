"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { List } from "@kanbix/shared-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCards } from "@/hooks/use-cards";
import { useCreateCard } from "@/hooks/use-create-card";
import { QuickAddForm } from "./quick-add-form";
import { SortableCard } from "./sortable-card";
import type { ListDropData } from "./dnd";

export function ListColumn({ list }: { list: List }) {
  const cards = useCards(list.id);
  const createCard = useCreateCard(list.id);

  const dropData: ListDropData = { type: "list", listId: list.id };
  const { setNodeRef } = useDroppable({ id: list.id, data: dropData });

  return (
    <div
      ref={setNodeRef}
      className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-muted/50 p-3"
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium">{list.name}</h2>
        {cards.isSuccess && (
          <span className="text-xs text-muted-foreground">
            {cards.data.length}
          </span>
        )}
      </div>

      {cards.isPending ? (
        <div
          className="space-y-2"
          role="status"
          aria-label={`Carregando cartões de ${list.name}`}
        >
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : cards.isError ? (
        <div className="rounded-md border border-dashed p-3 text-center">
          <p className="text-xs text-muted-foreground">Erro ao carregar.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cards.refetch()}
            disabled={cards.isFetching}
          >
            Tentar de novo
          </Button>
        </div>
      ) : cards.data.length === 0 ? (
        <p className="px-1 py-2 text-xs text-muted-foreground">Sem cartões.</p>
      ) : (
        <SortableContext
          items={cards.data.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {cards.data.map((card, index) => (
              <SortableCard
                key={card.id}
                card={card}
                listId={list.id}
                index={index}
              />
            ))}
          </ul>
        </SortableContext>
      )}

      <QuickAddForm
        addLabel="Adicionar cartão"
        placeholder="Título do cartão"
        multiline
        onAdd={(title) => createCard.mutateAsync({ title })}
      />
    </div>
  );
}
