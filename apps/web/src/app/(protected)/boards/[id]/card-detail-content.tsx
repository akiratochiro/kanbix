"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle } from "lucide-react";
import type { Card } from "@kanbix/shared-types";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { useCard } from "@/hooks/use-card";
import { useUpdateCard } from "@/hooks/use-update-card";
import { useDeleteCard } from "@/hooks/use-delete-card";
import { useBoard } from "@/hooks/use-board";
import { useMembers } from "@/hooks/use-members";
import {
  CARD_PRIORITIES,
  cardDetailSchema,
  dueDateFromCard,
  dueDateToPayload,
  assigneeIdFromCard,
  assigneeIdToPayload,
  UNASSIGNED,
  type CardDetailFormData,
} from "./card-detail-schema";

export function CardDetailContent({
  cardId,
  boardId,
}: {
  cardId: string;
  boardId: string;
}) {
  const card = useCard(cardId);

  if (card.isPending) {
    return (
      <div className="space-y-4" role="status" aria-label="Carregando cartão">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-9 w-40" />
      </div>
    );
  }

  if (card.isError) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Cartão não encontrado</h2>
        <p className="text-sm text-muted-foreground">
          Ele foi excluído ou você não tem mais acesso a ele.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/boards/${boardId}`}>Voltar ao quadro</Link>
        </Button>
      </div>
    );
  }

  return <CardDetailForm card={card.data} boardId={boardId} />;
}

function CardDetailForm({ card, boardId }: { card: Card; boardId: string }) {
  const router = useRouter();
  const board = useBoard(boardId);
  const members = useMembers(board.data?.workspaceId ?? "");
  const updateCard = useUpdateCard(card.id);
  const toggleComplete = useUpdateCard(card.id);
  const deleteCard = useDeleteCard(card.id, card.listId);

  const form = useForm<CardDetailFormData>({
    resolver: zodResolver(cardDetailSchema),
    defaultValues: {
      title: card.title,
      description: card.description ?? "",
      priority: card.priority,
      dueDate: dueDateFromCard(card.dueDate),
      assigneeId: assigneeIdFromCard(card.assigneeId),
    },
  });

  function onSubmit(data: CardDetailFormData) {
    updateCard.mutate({
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: dueDateToPayload(data.dueDate),
      assigneeId: assigneeIdToPayload(data.assigneeId),
    });
  }

  function handleToggleComplete() {
    toggleComplete.mutate({
      completedAt: card.completedAt ? null : new Date().toISOString(),
    });
  }

  function handleDelete() {
    deleteCard.mutate(undefined, {
      onSuccess: () => router.push(`/boards/${boardId}`),
    });
  }

  const serverError = updateCard.error
    ? updateCard.error instanceof ApiError
      ? updateCard.error.message
      : "Não foi possível salvar o cartão."
    : null;

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleComplete}
          disabled={toggleComplete.isPending}
          className={card.completedAt ? "border-green-600 text-green-600" : ""}
        >
          {card.completedAt ? (
            <CheckCircle2 className="text-green-600" />
          ) : (
            <Circle />
          )}
          {card.completedAt ? "Concluído" : "Marcar como concluído"}
        </Button>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input className="text-base font-medium" {...field} />
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
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Sem descrição" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CARD_PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data-limite</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="assigneeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger disabled={members.isPending}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Sem responsável</SelectItem>
                  {members.data?.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" className="text-destructive">
                Excluir cartão
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir este cartão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button type="submit" disabled={updateCard.isPending}>
            {updateCard.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
