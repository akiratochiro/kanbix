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