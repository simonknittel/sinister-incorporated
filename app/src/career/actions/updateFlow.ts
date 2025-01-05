"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { FlowNodeType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { serializeError } from "serialize-error";
import { z } from "zod";

const nodesSchema = z.array(
  z.discriminatedUnion("type", [
    z.object({
      type: z.enum(["role"]),
      id: z.string().cuid2(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      data: z.object({
        id: z.string().cuid(),
      }),
      measured: z.object({
        width: z.number(),
        height: z.number(),
      }),
    }),
  ]),
);

const edgesSchema = z.array(
  z.object({
    id: z.string(),
    type: z.literal("step"),
    source: z.string().cuid2(),
    target: z.string().cuid2(),
  }),
);

const schema = z.object({
  flowId: z.string(),
  nodes: nodesSchema,
  edges: edgesSchema,
});

export const updateFlow = async (formData: FormData) => {
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
        error: "Ungültige Anfrage",
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
        error: "Ungültige Anfrage",
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
      prisma.flowEdge.deleteMany({
        where: {
          flowId: result.data.flowId,
        },
      }),

      prisma.flowNode.deleteMany({
        where: {
          flowId: result.data.flowId,
        },
      }),

      prisma.flowNode.createMany({
        data: result.data.nodes.map((node) => {
          let type: FlowNodeType;
          switch (node.type) {
            case "role":
              type = FlowNodeType.ROLE;
              break;
            default:
              throw new Error("Invalid node type");
          }

          return {
            id: node.id,
            flowId: result.data.flowId,
            type,
            positionX: node.position.x,
            positionY: node.position.y,
            width: node.measured.width,
            height: node.measured.height,
            roleId: node.data.id,
          };
        }),
      }),

      prisma.flowEdge.createMany({
        data: result.data.edges.map((edge) => ({
          id: edge.id,
          flowId: result.data.flowId,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
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
      success: "Erfolgreich gespeichert.",
    };
  } catch (error) {
    void log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error:
        "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
    };
  }
};
