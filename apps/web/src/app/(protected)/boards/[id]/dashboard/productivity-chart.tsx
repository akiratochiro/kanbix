"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DayCount {
  date: string;
  count: number;
}

function formatDayLabel(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

export function ProductivityChart({ data }: { data: DayCount[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((day) => day.count));
  const total = data.reduce((sum, day) => sum + day.count, 0);

  return (
    <div>
      <div
        className="flex h-40 items-end gap-[2px]"
        role="img"
        aria-label="Cartões concluídos por dia, últimos 14 dias"
      >
        {data.map((day, index) => {
          const heightPct = day.count === 0 ? 0 : Math.max((day.count / max) * 100, 6);
          const isHovered = hovered === index;

          return (
            <div key={day.date} className="relative flex h-full flex-1 items-end">
              {isHovered && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs shadow-sm"
                >
                  <span className="font-semibold text-popover-foreground">
                    {day.count}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    em {formatDayLabel(day.date)}
                  </span>
                </div>
              )}
              <button
                type="button"
                className={cn(
                  "w-full rounded-t-[4px] bg-[var(--color-chart-1)] transition-opacity",
                  day.count === 0 && "bg-muted",
                  isHovered ? "opacity-100" : "opacity-80 hover:opacity-100"
                )}
                style={{ height: `${heightPct}%` }}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                aria-label={`${formatDayLabel(day.date)}: ${day.count} concluído(s)`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-[2px] text-[10px] text-muted-foreground">
        {data.map((day, index) => (
          <div key={day.date} className="flex-1 text-center">
            {index % 3 === 0 ? formatDayLabel(day.date) : ""}
          </div>
        ))}
      </div>
      {total === 0 && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Nenhum cartão concluído nos últimos 14 dias.
        </p>
      )}
    </div>
  );
}
