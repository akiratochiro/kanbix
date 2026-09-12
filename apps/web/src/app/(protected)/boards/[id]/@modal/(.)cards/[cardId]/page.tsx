import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CardDetailContent } from "../../../card-detail-content";
import { CardDetailModal } from "../../../card-detail-modal";

export default async function InterceptedCardPage({
  params,
}: {
  params: Promise<{ id: string; cardId: string }>;
}) {
  const { id, cardId } = await params;

  return (
    <CardDetailModal>
      <DialogTitle className="sr-only">Editar cartão</DialogTitle>
      <DialogDescription className="sr-only">
        Detalhes e edição do cartão selecionado.
      </DialogDescription>
      <CardDetailContent cardId={cardId} boardId={id} />
    </CardDetailModal>
  );
}
