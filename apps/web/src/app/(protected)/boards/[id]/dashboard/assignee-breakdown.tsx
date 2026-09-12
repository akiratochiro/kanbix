import type { WorkspaceMember } from "@kanbix/shared-types";

const CATEGORICAL_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface AssigneeCount {
  assigneeId: string | null;
  count: number;
}

export function AssigneeBreakdown({
  data,
  members,
}: {
  data: AssigneeCount[];
  members: WorkspaceMember[];
}) {
  const withCards = data.filter((row) => row.count > 0);

  if (withCards.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum cartão neste quadro ainda.</p>
    );
  }

  const max = Math.max(...withCards.map((row) => row.count));

  const rows = withCards
    .map((row) => ({
      ...row,
      name: row.assigneeId
        ? (members.find((member) => member.userId === row.assigneeId)?.name ??
          "Ex-membro")
        : "Sem responsável",
    }))
    // Ordem estável por nome (a cor segue a pessoa, nunca a contagem) —
    // "Sem responsável" sempre por último, já que não é uma identidade real.
    .sort((a, b) => {
      if (a.assigneeId === null) return 1;
      if (b.assigneeId === null) return -1;
      return a.name.localeCompare(b.name, "pt-BR");
    });

  return (
    <ul className="space-y-2">
      {rows.map((row, index) => (
        <li key={row.assigneeId ?? "unassigned"} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm" title={row.name}>
            {row.name}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(row.count / max) * 100}%`,
                backgroundColor: row.assigneeId
                  ? CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]
                  : "var(--color-muted-foreground)",
              }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
            {row.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
