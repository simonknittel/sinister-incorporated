import type { PermissionSet } from "@sam-monorepo/domain";
import type { ReactNode } from "react";

interface AuthRequirement {
  resource: PermissionSet["resource"];
  action: PermissionSet["operation"];
}

export interface ChangelogEntry {
  key: string;
  date: string;
  title: string;
  tags?: string[];
  body: () => ReactNode;
  isTracked?: boolean;
  requiresAuth?: AuthRequirement;
}
