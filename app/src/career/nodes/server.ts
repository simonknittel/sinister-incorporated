import { markdownNode } from "./Markdown/server";
import { roleNode } from "./Role/server";

export const nodeDefinitions = [markdownNode, roleNode] as const;
