"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckSquare } from "lucide-react";
import type { Card } from "@kanbix/shared-types";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = "secondary" | "default" | "destructive";

const priorityBadge: Record<
  Card["priority"],
  { label: string; variant: BadgeVariant } | null
> = {
  LOW: null,
  MEDIUM: { label: "Média", variant: "secondary" },
  HIGH: { label: "Alta", variant: "default" },
  URGENT: { label: "Urgente", variant: "destructive" },
};

function formatDueDate(iso: string) {
  // UTC: a data-limite é um dia de calendário; sem isso o fuso local
  // do navegador pode empurrá-la para o dia anterior/seguinte.
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

export function CardBox({ card }: { card: Card }) {
  const { id: boardId } = useParams<{ id: string }>();
  const badge = priorityBadge[card.priority];

  return (
    <Link
      href={`/boards/${boardId}/cards/${card.id}`}
      className="block rounded-md border bg-background p-3 text-left shadow-sm transition hover:border-ring"
    >
      {card.labels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {card.labels.map((label) => (
            <span
              key={label.id}
              role="img"
              aria-label={label.name}
              className="h-1.5 w-6 rounded-full"
              style={{ backgroundColor: label.color }}
            />
          ))}
        </div>
      )}
      <p className="text-sm">{card.title}</p>
      {(badge || card.dueDate || card.checklist.total > 0) && (
        <div className="mt-2 flex items-center gap-2">
          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
          {card.dueDate && (
            <span className="text-xs text-muted-foreground">
              {formatDueDate(card.dueDate)}
            </span>
          )}
          {card.checklist.total > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckSquare className="size-3" />
              {card.checklist.completed}/{card.checklist.total}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
