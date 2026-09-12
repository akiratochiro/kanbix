"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Board } from "@kanbix/shared-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api-client";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useBoards } from "@/hooks/use-boards";
import { useDeleteBoard } from "@/hooks/use-delete-board";
import { CreateBoardDialog } from "./create-board-dialog";

export default function WorkspaceDetailPage() {
  const { id: workspaceId } = useParams<{ id: string }>();

  const workspacesQuery = useWorkspaces();
  const workspace = workspacesQuery.data?.find((w) => w.id === workspaceId);
  const notFound = workspacesQuery.isSuccess && !workspace;

  const boards = useBoards(workspaceId);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href="/workspaces">
            <ArrowLeft />
            Workspaces
          </Link>
        </Button>

        {workspacesQuery.isPending ? (
          <Skeleton className="h-8 w-48" />
        ) : workspacesQuery.isError ? (
          <h1 className="text-2xl font-semibold">
            Não foi possível carregar o workspace.
          </h1>
        ) : notFound ? (
          <div>
            <h1 className="text-2xl font-semibold">Workspace não encontrado</h1>
            <p className="text-sm text-muted-foreground">
              Ele não existe ou você não faz parte dele.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-semibold">{workspace!.name}</h1>
            {workspace!.description && (
              <p className="text-sm text-muted-foreground">
                {workspace!.description}
              </p>
            )}
          </div>
        )}
      </div>

      {workspacesQuery.isSuccess && workspace && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-medium">Quadros</h2>
            <CreateBoardDialog
              workspaceId={workspace!.id}
              trigger={
                <Button size="sm" variant="outline">
                  Novo quadro
                </Button>
              }
            />
          </div>

          {boards.isPending ? (
            <BoardsSkeleton />
          ) : boards.isError ? (
            <BoardsError
              onRetry={() => boards.refetch()}
              isRetrying={boards.isFetching}
            />
          ) : boards.data.length === 0 ? (
            <BoardsEmpty workspaceId={workspace!.id} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boards.data.map((board) => (
                <li key={board.id}>
                  <Link
                    href={`/boards/${board.id}`}
                    className="block rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <Card
                      className="h-full transition-colors hover:border-ring"
                      style={{ borderTopColor: board.color, borderTopWidth: 3 }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle>{board.name}</CardTitle>
                          <DeleteBoardButton
                            board={board}
                            workspaceId={workspaceId}
                          />
                        </div>
                        {board.description && (
                          <CardDescription>{board.description}</CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

function DeleteBoardButton({
  board,
  workspaceId,
}: {
  board: Board;
  workspaceId: string;
}) {
  const [open, setOpen] = useState(false);
  const deleteBoard = useDeleteBoard(workspaceId);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) deleteBoard.reset();
  }

  function handleDelete() {
    deleteBoard.mutate(board.id, { onSuccess: () => setOpen(false) });
  }

  const serverError = deleteBoard.error
    ? deleteBoard.error instanceof ApiError
      ? deleteBoard.error.message
      : "Não foi possível excluir o quadro."
    : null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {/* Sem AlertDialogTrigger: precisamos de preventDefault aqui (pro
          Link do card não navegar), e isso faria o Radix pular a própria
          lógica de abrir o diálogo — por isso o open é só nosso. */}
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={`Excluir quadro ${board.name}`}
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        <Trash2 className="size-3.5" />
      </Button>
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Excluir &quot;{board.name}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Todas as listas e cartões dentro deste quadro também serão
            excluídos. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {serverError && (
          <p className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteBoard.isPending}
          >
            {deleteBoard.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BoardsSkeleton() {
  return (
    <ul
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Carregando quadros"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index}>
          <Card>
            <CardHeader className="gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function BoardsError({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar os quadros.
      </p>
      <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? "Tentando..." : "Tentar de novo"}
      </Button>
    </div>
  );
}

function BoardsEmpty({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Este workspace ainda não tem quadros.
      </p>
      <CreateBoardDialog
        workspaceId={workspaceId}
        trigger={<Button variant="outline">Criar quadro</Button>}
      />
    </div>
  );
}
