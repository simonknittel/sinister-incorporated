"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import {
  FlowNodeMarkdownPosition,
  FlowNodeRoleImage,
  FlowNodeType,
} from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const nodesSchema = z.array(
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal(FlowNodeType.ROLE),
      id: z.string().cuid2(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      width: z.number(),
      height: z.number(),
      data: z.object({
        role: z.object({
          id: z.string().cuid(),
        }),
        roleImage: z.nativeEnum(FlowNodeRoleImage),
        backgroundColor: z.string().optional(),
        backgroundTransparency: z.number().min(0).max(1).optional(),
      }),
    }),
    z.object({
      type: z.literal(FlowNodeType.MARKDOWN),
      id: z.string().cuid2(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      width: z.number(),
      height: z.number(),
      data: z.object({
        markdown: z.string(),
        markdownPosition: z.nativeEnum(FlowNodeMarkdownPosition),
        backgroundColor: z.string().optional(),
        backgroundTransparency: z.number().min(0).max(1).optional(),
      }),
    }),
  ]),
);

const edgesSchema = z.array(
  z.object({
    id: z.string(),
    type: z.string(),
    source: z.string().cuid2(),
    sourceHandle: z.string(),
    target: z.string().cuid2(),
    targetHandle: z.string(),
  }),
);

const schema = z.object({
  flowId: z.string(),
  nodes: nodesSchema,
  edges: edgesSchema,
});

export const updateFlow = async (formData: FormData) => {
  const t = await getTranslations();

  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateFlow");

    /**
     * Validate the request
     */
    const nodes = formData.get("nodes");
    const edges = formData.get("edges");
    if (!nodes || !edges) {
      void log.warn("Bad Request", { error: "Missing nodes or edges" });
      return {
        error: t("Common.badRequest"),
        requestPayload: formData,
      };
    }
    const result = schema.safeParse({
      flowId: formData.get("flowId"),
      nodes: JSON.parse(nodes as string) as unknown,
      edges: JSON.parse(edges as string) as unknown,
    });
    if (!result.success) {
      void log.warn("Bad Request", { error: serializeError(result.error) });
      return {
        error: t("Common.badRequest"),
        requestPayload: formData,
      };
    }

    /**
     * Authenticate and authorize the request
     */
    await authentication.authorizeAction("career", "update", [
      {
        key: "flowId",
        value: result.data.flowId,
      },
    ]);

    /**
     * Update flow
     */
    await prisma.$transaction([
      prisma.flowNode.deleteMany({
        where: {
          flowId: result.data.flowId,
        },
      }),

      prisma.flowNode.createMany({
        data: result.data.nodes.map((node) => {
          return {
            id: node.id,
            flowId: result.data.flowId,
            type: node.type,
            positionX: node.position.x,
            positionY: node.position.y,
            width: node.width,
            height: node.height,
            ...(node.type === FlowNodeType.ROLE
              ? {
                  roleId: node.data.role.id,
                  roleImage: node.data.roleImage,
                }
              : {}),
            ...(node.type === FlowNodeType.MARKDOWN
              ? {
                  markdown: node.data.markdown,
                  markdownPosition: node.data.markdownPosition,
                }
              : {}),
            backgroundColor: node.data.backgroundColor,
            backgroundTransparency: node.data.backgroundTransparency,
          };
        }),
      }),

      prisma.flowEdge.createMany({
        data: result.data.edges.map((edge) => ({
          id: edge.id,
          type: edge.type,
          sourceId: edge.source,
          sourceHandle: edge.sourceHandle,
          targetId: edge.target,
          targetHandle: edge.targetHandle,
        })),
      }),
    ]);

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/career/${result.data.flowId}`);

    /**
     * Respond with the result
     */
    return {
      success: t("Common.successfullySaved"),
    };
  } catch (error) {
    unstable_rethrow(error);
    void log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error: t("Common.internalServerError"),
      requestPayload: formData,
    };
  }
};
