"use client";

import type { Card, List } from "@kanbix/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCards } from "@/hooks/use-cards";

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

export function ListColumn({ list }: { list: List }) {
  const cards = useCards(list.id);

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-muted/50 p-3">
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
        <ul className="space-y-2">
          {cards.data.map((card) => {
            const badge = priorityBadge[card.priority];
            return (
              <li key={card.id}>
                <div className="rounded-md border bg-background p-3 shadow-sm">
                  <p className="text-sm">{card.title}</p>
                  {(badge || card.dueDate) && (
                    <div className="mt-2 flex items-center gap-2">
                      {badge && (
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      )}
                      {card.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {formatDueDate(card.dueDate)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
