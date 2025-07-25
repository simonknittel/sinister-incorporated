import { markdownNode } from "./Markdown/client";
import { roleNode } from "./Role/client";

export const nodeDefinitions = [markdownNode, roleNode] as const;
