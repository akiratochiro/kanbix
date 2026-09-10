"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useBoards } from "@/hooks/use-boards";

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
          <h2 className="mb-3 text-lg font-medium">Quadros</h2>

          {boards.isPending ? (
            <BoardsSkeleton />
          ) : boards.isError ? (
            <BoardsError
              onRetry={() => boards.refetch()}
              isRetrying={boards.isFetching}
            />
          ) : boards.data.length === 0 ? (
            <BoardsEmpty />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boards.data.map((board) => (
                <li key={board.id}>
                  <Card
                    style={{ borderTopColor: board.color, borderTopWidth: 3 }}
                  >
                    <CardHeader>
                      <CardTitle>{board.name}</CardTitle>
                      {board.description && (
                        <CardDescription>{board.description}</CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
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

function BoardsEmpty() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Este workspace ainda não tem quadros.
    </div>
  );
}
