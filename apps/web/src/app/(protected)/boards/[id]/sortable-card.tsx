"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { Card } from "@kanbix/shared-types";
import { CardBox } from "./card-box";
import type { CardDragData } from "./dnd";

export function SortableCard({
  card,
  listId,
  index,
}: {
  card: Card;
  listId: string;
  index: number;
}) {
  const data: CardDragData = { type: "card", card, listId, index };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("touch-none", isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
    >
      <CardBox card={card} />
    </li>
  );
}
