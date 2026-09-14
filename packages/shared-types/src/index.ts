export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface WorkspaceWithRole extends Workspace {
  role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  color: string;
  workspaceId: string;
  createdById: string;
  createdAt: string;
}

export interface List {
  id: string;
  name: string;
  position: number;
  boardId: string;
  createdAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  position: number;
  cardId: string;
  createdAt: string;
}

export interface BoardDashboard {
  totalCards: number;
  completedCards: number;
  overdueCards: number;
  completionRate: number;
  cardsByAssignee: { assigneeId: string | null; count: number }[];
  completedByDay: { date: string; count: number }[];
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  completedAt: string | null;
  listId: string;
  assigneeId: string | null;
  createdAt: string;
  labels: Label[];
  checklist: { total: number; completed: number };
}