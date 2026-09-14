"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { WorkspaceWithRole } from "@kanbix/shared-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth-context";
import { WORKSPACE_ROLE_LABELS } from "@/lib/workspace-roles";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useDeleteWorkspace } from "@/hooks/use-delete-workspace";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

export default function WorkspacesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: workspaces, isPending, isError, refetch, isFetching } =
    useWorkspaces();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Logado como {user?.name} ({user?.email}).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateWorkspaceDialog trigger={<Button>Novo workspace</Button>} />
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <section>
        {isPending ? (
          <WorkspacesSkeleton />
        ) : isError ? (
          <WorkspacesError onRetry={() => refetch()} isRetrying={isFetching} />
        ) : workspaces.length === 0 ? (
          <WorkspacesEmpty />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <li key={workspace.id}>
                <Link
                  href={`/workspaces/${workspace.id}`}
                  className="block rounded-xl transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <Card className="h-full transition-colors hover:border-ring">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle>{workspace.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {WORKSPACE_ROLE_LABELS[workspace.role]}
                          </Badge>
                          {workspace.role === "OWNER" && (
                            <DeleteWorkspaceButton workspace={workspace} />
                          )}
                        </div>
                      </div>
                      {workspace.description && (
                        <CardDescription>
                          {workspace.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function WorkspacesSkeleton() {
  return (
    <ul
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Carregando workspaces"
    >
      {Array.from({ length: 4 }).map((_, index) => (
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

function WorkspacesError({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar seus workspaces.
      </p>
      <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? "Tentando..." : "Tentar de novo"}
      </Button>
    </div>
  );
}

function DeleteWorkspaceButton({
  workspace,
}: {
  workspace: WorkspaceWithRole;
}) {
  const [open, setOpen] = useState(false);
  const deleteWorkspace = useDeleteWorkspace();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* Sem AlertDialogTrigger: o Link ao redor do card precisa que a
          gente chame preventDefault aqui, e isso faria o Radix pular a
          própria lógica de abrir o diálogo (composeEventHandlers só
          roda o handler dele se defaultPrevented ainda for false). */}
      <Button
        variant="ghost"
        size="icon"
        className="size-6 text-muted-foreground hover:text-destructive"
        aria-label={`Excluir workspace ${workspace.name}`}
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
            Excluir &quot;{workspace.name}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Todos os quadros, listas e cartões dentro deste workspace também
            serão excluídos. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteWorkspace.mutate(workspace.id)}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function WorkspacesEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Você ainda não participa de nenhum workspace.
      </p>
      <CreateWorkspaceDialog
        trigger={<Button variant="outline">Criar workspace</Button>}
      />
    </div>
  );
}
