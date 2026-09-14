"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, Trash2 } from "lucide-react";
import type { List } from "@kanbix/shared-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCards } from "@/hooks/use-cards";
import { useCreateCard } from "@/hooks/use-create-card";
import { useDeleteList } from "@/hooks/use-delete-list";
import { ListTitle } from "./list-title";
import { QuickAddForm } from "./quick-add-form";
import { SortableCard } from "./sortable-card";
import type { ListDragHandleProps, ListDropData } from "./dnd";

export function ListColumn({
  list,
  dragHandleProps,
}: {
  list: List;
  dragHandleProps?: ListDragHandleProps;
}) {
  const cards = useCards(list.id);
  const createCard = useCreateCard(list.id);
  const deleteList = useDeleteList(list.boardId);

  // Id distinto do drag da própria lista (que usa list.id) — só a data importa
  // pra resolveCardDrop, então o id em si pode ser qualquer string única.
  const dropData: ListDropData = { type: "list", listId: list.id };
  const { setNodeRef } = useDroppable({
    id: `dropzone:${list.id}`,
    data: dropData,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-muted/50 p-3"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <button
            type="button"
            ref={dragHandleProps?.setActivatorNodeRef}
            className="shrink-0 touch-none text-muted-foreground hover:text-foreground"
            aria-label={`Arrastar lista ${list.name}`}
            {...dragHandleProps?.attributes}
            {...dragHandleProps?.listeners}
          >
            <GripVertical className="size-3.5" />
          </button>
          <h2 className="min-w-0 flex-1">
            <ListTitle listId={list.id} boardId={list.boardId} name={list.name} />
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {cards.isSuccess && (
            <span className="text-xs text-muted-foreground">
              {cards.data.length}
            </span>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-destructive"
                aria-label={`Excluir lista ${list.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir esta lista?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os cartões dentro de &quot;{list.name}&quot; também
                  serão excluídos. Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteList.mutate(list.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
