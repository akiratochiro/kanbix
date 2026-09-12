"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
      <p className="text-sm">{card.title}</p>
      {(badge || card.dueDate) && (
        <div className="mt-2 flex items-center gap-2">
          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
          {card.dueDate && (
            <span className="text-xs text-muted-foreground">
              {formatDueDate(card.dueDate)}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
