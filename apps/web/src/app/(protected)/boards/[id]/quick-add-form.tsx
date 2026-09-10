"use client";

import { useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api-client";

interface QuickAddFormProps {
  /** Texto do botão que abre o formulário. */
  addLabel: string;
  placeholder: string;
  /** Usa Textarea (Enter envia, Shift+Enter quebra linha) em vez de Input. */
  multiline?: boolean;
  /** Recebe o valor já trimado. Deve rejeitar para manter o form aberto. */
  onAdd: (value: string) => Promise<unknown>;
}

export function QuickAddForm({
  addLabel,
  placeholder,
  multiline,
  onAdd,
}: QuickAddFormProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setValue("");
    setError(null);
  }

  async function submit() {
    const trimmed = value.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setError(null);
    try {
      await onAdd(trimmed);
      close();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível salvar."
      );
    } finally {
      setPending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
    }
    if (multiline && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        + {addLabel}
      </Button>
    );
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {multiline ? (
        <Textarea
          autoFocus
          rows={2}
          value={value}
          placeholder={placeholder}
          disabled={pending}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <Input
          autoFocus
          value={value}
          placeholder={placeholder}
          disabled={pending}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending || !value.trim()}>
          {pending ? "Salvando..." : "Adicionar"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={close}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
