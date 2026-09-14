"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { CardCloseGuardProvider } from "./card-close-guard";

export function CardDetailModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isDirtyRef = useRef(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  function handleOpenChange(open: boolean) {
    if (open) return;
    if (isDirtyRef.current) {
      setConfirmDiscard(true);
      return;
    }
    router.back();
  }

  return (
    <CardCloseGuardProvider
      value={{
        setDirty: (dirty) => {
          isDirtyRef.current = dirty;
        },
      }}
    >
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">{children}</DialogContent>
      </Dialog>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você editou título, descrição, prioridade, data-limite ou
              responsável mas ainda não clicou em Salvar. Etiquetas e
              checklist já marcados continuam salvos. Ao sair agora, o resto
              da edição será perdido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.back()}>
              Descartar e sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardCloseGuardProvider>
  );
}
