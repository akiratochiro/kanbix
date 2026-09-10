"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function WorkspacesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Logado como {user?.name} ({user?.email}).
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Sair
        </Button>
      </header>

      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        A listagem de workspaces entra num passo dedicado.
      </div>
    </main>
  );
}
