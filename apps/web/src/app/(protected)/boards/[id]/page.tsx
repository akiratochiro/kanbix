"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoard } from "@/hooks/use-board";
import { useLists } from "@/hooks/use-lists";
import { ListColumn } from "./list-column";

export default function BoardPage() {
  const { id: boardId } = useParams<{ id: string }>();

  const board = useBoard(boardId);
  const lists = useLists(boardId);

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link
            href={
              board.data
                ? `/workspaces/${board.data.workspaceId}`
                : "/workspaces"
            }
          >
            <ArrowLeft />
            Voltar
          </Link>
        </Button>

        {board.isPending ? (
          <Skeleton className="h-8 w-56" />
        ) : board.isError ? (
          <div>
            <h1 className="text-2xl font-semibold">Quadro não encontrado</h1>
            <p className="text-sm text-muted-foreground">
              Ele não existe ou você não tem acesso.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className="size-4 rounded"
              style={{ backgroundColor: board.data.color }}
              aria-hidden
            />
            <h1 className="text-2xl font-semibold">{board.data.name}</h1>
          </div>
        )}
      </div>

      {board.isSuccess && (
        <section className="flex-1">
          {lists.isPending ? (
            <ListsSkeleton />
          ) : lists.isError ? (
            <ListsError
              onRetry={() => lists.refetch()}
              isRetrying={lists.isFetching}
            />
          ) : lists.data.length === 0 ? (
            <ListsEmpty />
          ) : (
            <ol className="flex gap-4 overflow-x-auto pb-4">
              {lists.data.map((list) => (
                <li key={list.id}>
                  <ListColumn list={list} />
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </main>
  );
}

function ListsSkeleton() {
  return (
    <ol
      className="flex gap-4 overflow-x-auto pb-4"
      role="status"
      aria-label="Carregando listas"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="w-72 shrink-0">
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </li>
      ))}
    </ol>
  );
}

function ListsError({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar as listas.
      </p>
      <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? "Tentando..." : "Tentar de novo"}
      </Button>
    </div>
  );
}

function ListsEmpty() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Este quadro ainda não tem listas.
    </div>
  );
}
