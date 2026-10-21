import {
  FlowNodeMarkdownPosition,
  FlowNodeRoleCitizensAlignment,
  FlowNodeRoleImage,
  FlowNodeType,
  type Prisma,
} from "@sam-monorepo/database/client";
import * as z from "zod";
import { idSchema } from "../pagination.js";

/** The limit against a crafted payload. A flow of the editor has far fewer. */
export const MAXIMUM_FLOW_NODES = 250;

/** The limit against a crafted payload. A flow of the editor has far fewer. */
export const MAXIMUM_FLOW_EDGES = 250;

/**
 * React Flow builds the id of an edge from the ids of its two nodes and
 * their handles: about 70 characters.
 */
const MAXIMUM_FLOW_EDGE_ID_LENGTH = 255;

/** Arbitrary cap of the text of a markdown node */
const MAXIMUM_MARKDOWN_LENGTH = 5000;

/** The fields of the box of each node type */
const flowNodeBoxShape = {
  id: idSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  width: z.number(),
  height: z.number(),
};

/** The background fields in the `data` of each node type */
const flowNodeBackgroundShape = {
  backgroundColor: z.string().optional(),
  backgroundTransparency: z.number().min(0).max(1).optional(),
};

const markdownFlowNodeSchema = z.object({
  type: z.literal(FlowNodeType.MARKDOWN),
  ...flowNodeBoxShape,
  data: z.object({
    markdown: z.string().max(MAXIMUM_MARKDOWN_LENGTH),
    markdownPosition: z.enum(FlowNodeMarkdownPosition),
    ...flowNodeBackgroundShape,
  }),
});

const roleFlowNodeSchema = z.object({
  type: z.literal(FlowNodeType.ROLE),
  ...flowNodeBoxShape,
  data: z.object({
    role: z.object({
      id: idSchema,
    }),
    roleImage: z.enum(FlowNodeRoleImage),
    ...flowNodeBackgroundShape,
    showUnlocked: z.boolean().nullish(),
  }),
});

const roleCitizensFlowNodeSchema = z.object({
  type: z.literal(FlowNodeType.ROLE_CITIZENS),
  ...flowNodeBoxShape,
  data: z.object({
    role: z.object({
      id: idSchema,
    }),
    roleCitizensAlignment: z.enum(FlowNodeRoleCitizensAlignment),
    roleCitizensHideRole: z.boolean(),
    ...flowNodeBackgroundShape,
    showUnlocked: z.boolean().nullish(),
  }),
});

/**
 * A node of the editor (React Flow). The object schemas remove the display
 * fields of React Flow, for example `selected` and `measured`.
 */
export const flowNodeSchema = z.discriminatedUnion("type", [
  markdownFlowNodeSchema,
  roleFlowNodeSchema,
  roleCitizensFlowNodeSchema,
]);

export type FlowNodeInput = z.infer<typeof flowNodeSchema>;

/**
 * The editor sends the React Flow edges, which also carry display fields
 * such as `type` and `markerEnd`. The database stores only the connection,
 * thus the object schema removes all other fields.
 */
export const flowEdgeSchema = z.object({
  id: z.string().min(1).max(MAXIMUM_FLOW_EDGE_ID_LENGTH),
  source: idSchema,
  sourceHandle: z.string(),
  target: idSchema,
  targetHandle: z.string(),
});

/** The row of a node of the editor in the flow */
export const toFlowNodeCreateData = (
  node: FlowNodeInput,
  flowId: string,
): Prisma.FlowNodeCreateManyInput => {
  const commonColumns = {
    id: node.id,
    flowId,
    type: node.type,
    positionX: node.position.x,
    positionY: node.position.y,
    width: node.width,
    height: node.height,
    backgroundColor: node.data.backgroundColor,
    backgroundTransparency: node.data.backgroundTransparency,
  };

  switch (node.type) {
    case FlowNodeType.MARKDOWN:
      return {
        ...commonColumns,
        markdown: node.data.markdown,
        markdownPosition: node.data.markdownPosition,
      };

    case FlowNodeType.ROLE:
      return {
        ...commonColumns,
        roleId: node.data.role.id,
        roleImage: node.data.roleImage,
        showUnlocked: node.data.showUnlocked,
      };

    case FlowNodeType.ROLE_CITIZENS:
      return {
        ...commonColumns,
        roleId: node.data.role.id,
        roleCitizensAlignment: node.data.roleCitizensAlignment,
        roleCitizensHideRole: node.data.roleCitizensHideRole,
        showUnlocked: node.data.showUnlocked,
      };

    default:
      throw new Error(
        `Unknown flow node type: ${JSON.stringify(node satisfies never)}`,
      );
  }
};
