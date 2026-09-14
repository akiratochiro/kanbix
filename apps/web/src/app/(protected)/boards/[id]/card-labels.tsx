"use client";

import { useState } from "react";
import { Check, Plus, Tag } from "lucide-react";
import type { Card, Label } from "@kanbix/shared-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// Reaproveita a paleta validada do board — mesmo conceito (algumas cores
// categóricas pra escolher), não faz sentido duplicar em board-schema.ts.
import { BOARD_COLORS } from "@/lib/board-schema";
import { useLabels } from "@/hooks/use-labels";
import { useCreateLabel } from "@/hooks/use-create-label";
import { useAddCardLabel } from "@/hooks/use-add-card-label";
import { useRemoveCardLabel } from "@/hooks/use-remove-card-label";

export function CardLabels({ card, boardId }: { card: Card; boardId: string }) {
  const [open, setOpen] = useState(false);
  const labels = useLabels(boardId);
  const addLabel = useAddCardLabel(card.id);
  const removeLabel = useRemoveCardLabel(card.id);

  const currentIds = new Set(card.labels.map((label) => label.id));

  function toggle(label: Label) {
    if (currentIds.has(label.id)) {
      removeLabel.mutate(label.id);
    } else {
      addLabel.mutate(label.id);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium">Etiquetas</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {card.labels.map((label) => (
          <span
            key={label.id}
            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: label.color }}
          >
            {label.name}
          </span>
        ))}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 gap-1 px-2 text-xs"
            >
              <Tag className="size-3" />
              {card.labels.length === 0 ? "Adicionar" : "Editar"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Etiquetas</DialogTitle>
              <DialogDescription>
                Clique para marcar ou desmarcar uma etiqueta neste cartão.
              </DialogDescription>
            </DialogHeader>

            <ul className="space-y-1">
              {labels.data?.map((label) => (
                <li key={label.id}>
                  <button
                    type="button"
                    onClick={() => toggle(label)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded"
                      style={{ backgroundColor: label.color }}
                    >
                      {currentIds.has(label.id) && (
                        <Check className="size-3.5 text-white" />
                      )}
                    </span>
                    {label.name}
                  </button>
                </li>
              ))}
              {labels.isSuccess && labels.data.length === 0 && (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  Nenhuma etiqueta neste board ainda.
                </p>
              )}
            </ul>

            <NewLabelForm boardId={boardId} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function NewLabelForm({ boardId }: { boardId: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(BOARD_COLORS[0].value);
  const createLabel = useCreateLabel(boardId);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    createLabel.mutate(
      { name: trimmed, color },
      {
        onSuccess: () => {
          setName("");
          setColor(BOARD_COLORS[0].value);
          setIsCreating(false);
        },
      }
    );
  }

  if (!isCreating) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="justify-start gap-1 text-muted-foreground"
        onClick={() => setIsCreating(true)}
      >
        <Plus className="size-3.5" />
        Nova etiqueta
      </Button>
    );
  }

  return (
    <div className="space-y-2 border-t pt-2">
      <Input
        autoFocus
        placeholder="Nome da etiqueta"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={50}
      />
      <div role="radiogroup" aria-label="Cor da etiqueta" className="flex gap-2">
        {BOARD_COLORS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={color === option.value}
            aria-label={option.label}
            onClick={() => setColor(option.value)}
            style={{ backgroundColor: option.value }}
            className={cn(
              "size-6 rounded-full ring-offset-background transition",
              color === option.value && "ring-2 ring-ring ring-offset-2"
            )}
          />
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsCreating(false)}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={createLabel.isPending || !name.trim()}
        >
          {createLabel.isPending ? "Criando..." : "Criar"}
        </Button>
      </div>
    </div>
  );
}
