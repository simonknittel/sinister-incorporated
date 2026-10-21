import type { Prisma } from "@sam-monorepo/database/client";
import {
  resolveFlowPermissions,
  type FlowViewer,
  type ResolvedFlowPermissions,
} from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

const FLOW_CONTEXT_SELECT = {
  id: true,
  name: true,
  slug: true,
  position: true,
  createdAt: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
  deletedAt: true,
  deletedById: true,
  roleAccess: { select: { roleId: true, type: true } },
} as const satisfies Prisma.FlowSelect;

/**
 * All about a flow except its diagram: the page that shows a flow loads its
 * nodes and edges (see `findReadableFlowDiagram()`).
 */
export type FlowContextFlow = Prisma.FlowGetPayload<{
  select: typeof FLOW_CONTEXT_SELECT;
}>;

export interface FlowContext {
  viewer: FlowViewer;
  /** All flows, also the soft-deleted ones, in display order */
  allFlows: FlowContextFlow[];
  /** The flows that are not soft-deleted, in display order */
  flows: FlowContextFlow[];
  flowsById: Map<string, FlowContextFlow>;
  /**
   * Only the flows that are not deleted: a deleted flow releases its slug,
   * thus a slug identifies at most one live flow but any number of deleted
   * ones.
   */
  flowsBySlug: Map<string, FlowContextFlow>;
  /** The effective permissions of the actor for each flow */
  permissions: Map<string, ResolvedFlowPermissions>;
}

/** The viewer of the flow permission rules of the domain package */
export const toFlowViewer = (actor: Actor): FlowViewer => ({
  roleIds: actor.roleIds,
  /**
   * The admin mode is part of `authorize()`, thus it also gives
   * `hasCareerManage`, which grants read and edit on each flow in the
   * resolver.
   */
  hasCareerManage: actor.authorize("career", "manage"),
});

/**
 * Loads all career flows and resolves the effective permissions of the
 * actor. All career reads of the app (the navigation, the flow page, the
 * management pages, the entry points) derive from this context.
 */
export const loadFlowContext = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
): Promise<FlowContext> => {
  const allFlows = await context.prisma.flow.findMany({
    select: FLOW_CONTEXT_SELECT,
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });

  const viewer = toFlowViewer(actor);
  const flows = allFlows.filter((flow) => flow.deletedAt === null);

  return {
    viewer,
    allFlows,
    flows,
    flowsById: new Map(allFlows.map((flow) => [flow.id, flow])),
    flowsBySlug: new Map(flows.map((flow) => [flow.slug, flow])),
    permissions: resolveFlowPermissions(allFlows, viewer),
  };
};

/**
 * The flows that are not deleted and that the actor can read, in display
 * order
 */
export const listReadableFlows = (
  flowContext: FlowContext,
): FlowContextFlow[] =>
  flowContext.flows.filter(
    (flow) => flowContext.permissions.get(flow.id)?.canRead,
  );
