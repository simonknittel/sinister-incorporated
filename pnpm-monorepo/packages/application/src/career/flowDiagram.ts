import type { FlowEdge, FlowNode } from "@sam-monorepo/database/client";
import { createFlowPermissionResolver } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { toFlowViewer } from "./flowContext.js";

/** A node of the diagram with its outgoing (`sources`) and incoming edges */
export type FlowDiagramNode = FlowNode & {
  sources: FlowEdge[];
  targets: FlowEdge[];
};

export interface FlowDiagram {
  readonly id: string;
  readonly nodes: FlowDiagramNode[];
}

/**
 * The diagram of one flow, or null when the flow does not exist, is deleted
 * or the actor cannot read it. The flow context, which each career page
 * loads, does not hold the diagrams: only the page that shows a flow needs
 * its nodes and edges.
 */
export const findReadableFlowDiagram = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
  { flowId }: { readonly flowId: string },
): Promise<FlowDiagram | null> => {
  const flow = await context.prisma.flow.findUnique({
    where: { id: flowId },
    select: {
      id: true,
      deletedAt: true,
      roleAccess: { select: { roleId: true, type: true } },
      nodes: { include: { sources: true, targets: true } },
    },
  });
  if (!flow) return null;

  /** A deleted flow grants nothing, thus it is not readable */
  const permissions = createFlowPermissionResolver(
    [flow],
    toFlowViewer(actor),
  ).get(flow.id);
  if (!permissions?.canRead) return null;

  return { id: flow.id, nodes: flow.nodes };
};
