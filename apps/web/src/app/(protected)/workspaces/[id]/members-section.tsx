"use client";

import type { WorkspaceMember, WorkspaceWithRole } from "@kanbix/shared-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api-client";
import { WORKSPACE_ROLE_LABELS } from "@/lib/workspace-roles";
import { useMembers } from "@/hooks/use-members";
import { useUpdateMemberRole } from "@/hooks/use-update-member-role";
import { useRemoveMember } from "@/hooks/use-remove-member";
import { InviteMemberDialog } from "./invite-member-dialog";

export function MembersSection({
  workspaceId,
  currentUserId,
  currentUserRole,
}: {
  workspaceId: string;
  currentUserId: string;
  currentUserRole: WorkspaceWithRole["role"];
}) {
  const members = useMembers(workspaceId);
  const updateRole = useUpdateMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);

  const canInvite = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  function canRemove(member: WorkspaceMember) {
    if (member.userId === currentUserId) return false;
    if (currentUserRole === "OWNER") return true;
    if (currentUserRole === "ADMIN") return member.role === "MEMBER";
    return false;
  }

  const actionError = updateRole.error ?? removeMember.error;
  const actionErrorMessage = actionError
    ? actionError instanceof ApiError
      ? actionError.message
      : "Não foi possível concluir a ação."
    : null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-lg font-medium">Membros</h2>
        {canInvite && (
          <InviteMemberDialog
            workspaceId={workspaceId}
            trigger={
              <Button size="sm" variant="outline">
                Convidar membro
              </Button>
            }
          />
        )}
      </div>

      {members.isPending ? (
        <ul className="space-y-2" role="status" aria-label="Carregando membros">
          {Array.from({ length: 2 }).map((_, index) => (
            <li key={index}>
              <Skeleton className="h-12 w-full" />
            </li>
          ))}
        </ul>
      ) : members.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os membros.
          </p>
          <Button
            variant="outline"
            onClick={() => members.refetch()}
            disabled={members.isFetching}
          >
            {members.isFetching ? "Tentando..." : "Tentar de novo"}
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {members.data.map((member) => (
            <li
              key={member.userId}
              className="flex items-center justify-between gap-4 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {member.name}
                  {member.userId === currentUserId && " (você)"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {currentUserRole === "OWNER" && member.userId !== currentUserId ? (
                  <Select
                    value={member.role}
                    onValueChange={(role) =>
                      updateRole.mutate({
                        userId: member.userId,
                        role: role as WorkspaceMember["role"],
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Dono</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MEMBER">Membro</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">
                    {WORKSPACE_ROLE_LABELS[member.role]}
                  </Badge>
                )}

                {canRemove(member) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remover {member.name} do workspace?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa pessoa perde acesso a todos os quadros deste
                          workspace. Essa ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeMember.mutate(member.userId)}
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {actionErrorMessage && (
        <p className="mt-2 text-sm font-medium text-destructive">
          {actionErrorMessage}
        </p>
      )}
    </section>
  );
}
