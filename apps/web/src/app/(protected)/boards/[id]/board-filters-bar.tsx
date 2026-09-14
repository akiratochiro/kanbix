"use client";

import { X } from "lucide-react";
import type { Card } from "@kanbix/shared-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLabels } from "@/hooks/use-labels";
import { useMembers } from "@/hooks/use-members";
import { CARD_PRIORITIES } from "./card-detail-schema";
import { useBoardFilters } from "./board-filters-context";
import { EMPTY_FILTERS, UNASSIGNED_FILTER, hasActiveFilters } from "./board-filters";

const ALL_ASSIGNEES = "ALL";

function chipClass(active: boolean) {
  return cn(
    "rounded-full border px-2.5 py-1 text-xs transition",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-input text-muted-foreground hover:text-foreground"
  );
}

export function BoardFiltersBar({
  boardId,
  workspaceId,
}: {
  boardId: string;
  workspaceId: string;
}) {
  const { filters, setFilters } = useBoardFilters();
  const labels = useLabels(boardId);
  const members = useMembers(workspaceId);

  function togglePriority(priority: Card["priority"]) {
    const next = new Set(filters.priorities);
    if (next.has(priority)) next.delete(priority);
    else next.add(priority);
    setFilters({ ...filters, priorities: next });
  }

  function toggleLabel(labelId: string) {
    const next = new Set(filters.labelIds);
    if (next.has(labelId)) next.delete(labelId);
    else next.add(labelId);
    setFilters({ ...filters, labelIds: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pb-2">
      <div
        role="group"
        aria-label="Filtrar por prioridade"
        className="flex flex-wrap items-center gap-1"
      >
        {CARD_PRIORITIES.map((priority) => (
          <button
            key={priority.value}
            type="button"
            aria-pressed={filters.priorities.has(priority.value)}
            onClick={() => togglePriority(priority.value)}
            className={chipClass(filters.priorities.has(priority.value))}
          >
            {priority.label}
          </button>
        ))}
      </div>

      {labels.data && labels.data.length > 0 && (
        <div
          role="group"
          aria-label="Filtrar por etiqueta"
          className="flex flex-wrap items-center gap-1"
        >
          {labels.data.map((label) => {
            const active = filters.labelIds.has(label.id);
            return (
              <button
                key={label.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleLabel(label.id)}
                style={
                  active
                    ? { backgroundColor: label.color, borderColor: label.color }
                    : undefined
                }
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition",
                  active
                    ? "text-white"
                    : "border-input text-muted-foreground hover:text-foreground"
                )}
              >
                {label.name}
              </button>
            );
          })}
        </div>
      )}

      <Select
        value={filters.assigneeId ?? ALL_ASSIGNEES}
        onValueChange={(value) =>
          setFilters({
            ...filters,
            assigneeId: value === ALL_ASSIGNEES ? null : value,
          })
        }
      >
        <SelectTrigger
          className="h-7 w-44 text-xs"
          disabled={members.isPending}
          aria-label="Filtrar por responsável"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_ASSIGNEES}>Todos os responsáveis</SelectItem>
          <SelectItem value={UNASSIGNED_FILTER}>Sem responsável</SelectItem>
          {members.data?.map((member) => (
            <SelectItem key={member.userId} value={member.userId}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        aria-pressed={filters.overdueOnly}
        onClick={() => setFilters({ ...filters, overdueOnly: !filters.overdueOnly })}
        className={chipClass(filters.overdueOnly)}
      >
        Atrasados
      </button>

      {hasActiveFilters(filters) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
          onClick={() => setFilters(EMPTY_FILTERS)}
        >
          <X className="size-3" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
