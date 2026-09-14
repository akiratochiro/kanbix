"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { List } from "@kanbix/shared-types";
import { ListColumn } from "./list-column";
import type { ListDragData } from "./dnd";

export function SortableListColumn({ list }: { list: List }) {
  const data: ListDragData = { type: "list-column", list };

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id, data });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && "opacity-40")}
    >
      <ListColumn
        list={list}
        dragHandleProps={{ attributes, listeners, setActivatorNodeRef }}
      />
    </li>
  );
}
