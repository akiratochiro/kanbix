"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import type { WorkspaceWithRole } from "@kanbix/shared-types";
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
import { workspaceFormSchema, type WorkspaceFormData } from "@/lib/workspace-schema";
import { useUpdateWorkspace } from "@/hooks/use-update-workspace";

export function EditWorkspaceDialog({
  workspace,
}: {
  workspace: WorkspaceWithRole;
}) {
  const [open, setOpen] = useState(false);
  const updateWorkspace = useUpdateWorkspace(workspace.id);

  const form = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description ?? "",
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // Mesmo motivo do EditBoardDialog: reseta com os dados atuais a cada
      // abertura, não só no mount, senão reabrir após salvar mostraria os
      // valores antigos "congelados" no useForm inicial.
      form.reset({
        name: workspace.name,
        description: workspace.description ?? "",
      });
    } else {
      updateWorkspace.reset();
    }
  }

  function onSubmit(data: WorkspaceFormData) {
    updateWorkspace.mutate(
      { name: data.name, description: data.description || undefined },
      { onSuccess: () => setOpen(false) }
    );
  }

  const serverError = updateWorkspace.error
    ? updateWorkspace.error instanceof ApiError
      ? updateWorkspace.error.message
      : "Não foi possível salvar as alterações."
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          aria-label="Editar workspace"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar workspace</DialogTitle>
          <DialogDescription>Nome e descrição do workspace.</DialogDescription>
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

            {serverError && (
              <p className="text-sm font-medium text-destructive">
                {serverError}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={updateWorkspace.isPending}>
                {updateWorkspace.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
