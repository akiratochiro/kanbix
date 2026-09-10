"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/lib/auth-context";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

const roleLabels: Record<WorkspaceWithRole["role"], string> = {
  OWNER: "Dono",
  ADMIN: "Admin",
  MEMBER: "Membro",
};

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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
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
          <ul className="grid gap-4 sm:grid-cols-2">
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
                        <Badge variant="secondary">
                          {roleLabels[workspace.role]}
                        </Badge>
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
      className="grid gap-4 sm:grid-cols-2"
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
