"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBoard } from "@/hooks/use-board";
import { useBoardDashboard } from "@/hooks/use-board-dashboard";
import { useMembers } from "@/hooks/use-members";
import { ProductivityChart } from "./productivity-chart";
import { AssigneeBreakdown } from "./assignee-breakdown";

export default function BoardDashboardPage() {
  const { id: boardId } = useParams<{ id: string }>();
  const board = useBoard(boardId);
  const dashboard = useBoardDashboard(boardId);
  const members = useMembers(board.data?.workspaceId ?? "");

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href={`/boards/${boardId}`}>
            <ArrowLeft />
            Voltar ao quadro
          </Link>
        </Button>

        <h1 className="text-2xl font-semibold">
          Dashboard {board.data ? `— ${board.data.name}` : ""}
        </h1>
      </div>

      {dashboard.isPending ? (
        <DashboardSkeleton />
      ) : dashboard.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar o dashboard.
          </p>
          <Button
            variant="outline"
            onClick={() => dashboard.refetch()}
            disabled={dashboard.isFetching}
          >
            {dashboard.isFetching ? "Tentando..." : "Tentar de novo"}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <StatTile label="Total de cartões" value={String(dashboard.data.totalCards)} />
            <StatTile
              label="Concluídos"
              value={String(dashboard.data.completedCards)}
              tone="good"
            />
            <StatTile
              label="Atrasados"
              value={String(dashboard.data.overdueCards)}
              tone={dashboard.data.overdueCards > 0 ? "critical" : undefined}
            />
            <StatTile
              label="Progresso"
              value={`${dashboard.data.completionRate}%`}
            />
          </div>

          <section>
            <h2 className="mb-3 text-lg font-medium">
              Produtividade (últimos 14 dias)
            </h2>
            <Card>
              <CardHeader>
                <ProductivityChart data={dashboard.data.completedByDay} />
              </CardHeader>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium">Cartões por responsável</h2>
            <Card>
              <CardHeader>
                {members.isPending ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <AssigneeBreakdown
                    data={dashboard.data.cardsByAssignee}
                    members={members.data ?? []}
                  />
                )}
              </CardHeader>
            </Card>
          </section>
        </>
      )}
    </main>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "critical";
}) {
  return (
    <Card>
      <CardHeader className="gap-1 pb-4">
        <CardDescription>{label}</CardDescription>
        <CardTitle
          className={cn(
            "text-3xl",
            tone === "good" && "text-[var(--color-viz-good)]",
            tone === "critical" && "text-[var(--color-viz-critical)]"
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
