"use client";

import { useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  SortableContext,
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import type { Card, List } from "@kanbix/shared-types";
import { cardKeys } from "@/lib/query-keys";
import { useCreateList } from "@/hooks/use-create-list";
import { useMoveCard } from "@/hooks/use-move-card";
import { useMoveList } from "@/hooks/use-move-list";
import { CardBox } from "./card-box";
import { QuickAddForm } from "./quick-add-form";
import { SortableListColumn } from "./sortable-list-column";
import {
  resolveCardDrop,
  resolveListDrop,
  type CardDragData,
  type ListDragData,
  type ListDropData,
} from "./dnd";

export function BoardColumns({
  boardId,
  lists,
}: {
  boardId: string;
  lists: List[];
}) {
  const queryClient = useQueryClient();
  const moveCard = useMoveCard();
  const moveList = useMoveList(boardId);
  const createList = useCreateList(boardId);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeList, setActiveList] = useState<List | null>(null);

  const sensors = useSensors(
    // distância evita que um clique no cartão vire drag
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as
      | CardDragData
      | ListDragData
      | undefined;
    setActiveCard(data?.type === "card" ? data.card : null);
    setActiveList(data?.type === "list-column" ? data.list : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    setActiveList(null);

    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as
      | CardDragData
      | ListDragData
      | undefined;

    if (activeData?.type === "list-column") {
      const overData = over.data.current as
        | CardDragData
        | ListDropData
        | ListDragData
        | undefined;
      const toIndex = resolveListDrop(lists, activeData.list.id, overData);
      if (toIndex === null) return;

      moveList.mutate({ listId: activeData.list.id, toIndex });
      return;
    }

    if (activeData?.type !== "card") return;

    const overData = over.data.current as
      | CardDragData
      | ListDropData
      | undefined;

    const resolved = resolveCardDrop(
      activeData,
      overData,
      (listId) =>
        (queryClient.getQueryData<Card[]>(cardKeys.listByList(listId)) ?? [])
          .length
    );
    if (!resolved) return;

    moveCard.mutate({
      cardId: String(active.id),
      fromListId: activeData.listId,
      toListId: resolved.toListId,
      toIndex: resolved.toIndex,
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveCard(null);
        setActiveList(null);
      }}
    >
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        <SortableContext
          items={lists.map((list) => list.id)}
          strategy={horizontalListSortingStrategy}
        >
          <ol className="flex gap-4">
            {lists.map((list) => (
              <SortableListColumn key={list.id} list={list} />
            ))}
          </ol>
        </SortableContext>
        <div className="w-72 shrink-0 rounded-lg bg-muted/30 p-2">
          <QuickAddForm
            addLabel="Adicionar lista"
            placeholder="Nome da lista"
            onAdd={(name) => createList.mutateAsync(name)}
          />
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="w-64">
            <CardBox card={activeCard} />
          </div>
        ) : activeList ? (
          <div className="w-72 rounded-lg bg-muted/50 p-3 shadow-lg">
            <p className="text-sm font-medium">{activeList.name}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
