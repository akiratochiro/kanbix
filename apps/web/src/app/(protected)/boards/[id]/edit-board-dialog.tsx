"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import type { Board } from "@kanbix/shared-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api-client";
import { BOARD_COLORS, boardFormSchema, type BoardFormData } from "@/lib/board-schema";
import { useUpdateBoard } from "@/hooks/use-update-board";

export function EditBoardDialog({ board }: { board: Board }) {
  const [open, setOpen] = useState(false);
  const updateBoard = useUpdateBoard(board.id, board.workspaceId);

  const form = useForm<BoardFormData>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: {
      name: board.name,
      description: board.description ?? "",
      color: board.color,
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // Reseta com os dados atuais do board a cada abertura — não com o
      // useForm's defaultValues "congelado" do primeiro mount, que ficaria
      // desatualizado após uma edição bem-sucedida anterior.
      form.reset({
        name: board.name,
        description: board.description ?? "",
        color: board.color,
      });
    } else {
      updateBoard.reset();
    }
  }

  function onSubmit(data: BoardFormData) {
    updateBoard.mutate(
      {
        name: data.name,
        description: data.description || undefined,
        color: data.color,
      },
      { onSuccess: () => setOpen(false) }
    );
  }

  const serverError = updateBoard.error
    ? updateBoard.error instanceof ApiError
      ? updateBoard.error.message
      : "Não foi possível salvar as alterações."
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          aria-label="Editar quadro"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar quadro</DialogTitle>
          <DialogDescription>Nome, descrição e cor do quadro.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <div
                    role="radiogroup"
                    aria-label="Cor do quadro"
                    className="flex gap-2"
                  >
                    {BOARD_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === color.value}
                        aria-label={color.label}
                        onClick={() => field.onChange(color.value)}
                        style={{ backgroundColor: color.value }}
                        className={cn(
                          "size-7 rounded-full ring-offset-background transition",
                          field.value === color.value &&
                            "ring-2 ring-ring ring-offset-2"
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-sm font-medium text-destructive">
                {serverError}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={updateBoard.isPending}>
                {updateBoard.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
