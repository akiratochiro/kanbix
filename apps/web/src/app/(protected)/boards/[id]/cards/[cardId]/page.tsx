import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardDetailContent } from "../../card-detail-content";

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string; cardId: string }>;
}) {
  const { id, cardId } = await params;

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href={`/boards/${id}`}>
          <ArrowLeft />
          Voltar ao quadro
        </Link>
      </Button>

      <div className="mx-auto w-full max-w-lg">
        <CardDetailContent cardId={cardId} boardId={id} />
      </div>
    </main>
  );
}
