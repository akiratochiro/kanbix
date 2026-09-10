"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useCreateBoard } from "@/hooks/use-create-board";
import {
  BOARD_COLORS,
  createBoardSchema,
  type CreateBoardFormData,
} from "./schema";

export function CreateBoardDialog({
  workspaceId,
  trigger,
}: {
  workspaceId: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const createBoard = useCreateBoard(workspaceId);

  const form = useForm<CreateBoardFormData>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      description: "",
      color: BOARD_COLORS[0].value,
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset();
      createBoard.reset();
    }
  }

  function onSubmit(data: CreateBoardFormData) {
    createBoard.mutate(
      {
        name: data.name,
        description: data.description || undefined,
        color: data.color,
      },
      { onSuccess: () => handleOpenChange(false) }
    );
  }

  const serverError = createBoard.error
    ? createBoard.error instanceof ApiError
      ? createBoard.error.message
      : "Não foi possível criar o quadro."
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo quadro</DialogTitle>
          <DialogDescription>
            Um quadro organiza tarefas em listas.
          </DialogDescription>
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
              <Button type="submit" disabled={createBoard.isPending}>
                {createBoard.isPending ? "Criando..." : "Criar quadro"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
