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

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  listId: string;
  assigneeId: string | null;
  createdAt: string;
}