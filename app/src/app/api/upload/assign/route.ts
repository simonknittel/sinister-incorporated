import { authenticateApi } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.discriminatedUnion("resourceType", [
  z.object({
    resourceType: z.literal("manufacturer"),
    resourceId: z.string().cuid(),
    resourceAttribute: z.literal("imageId"),
    imageId: z.string().cuid(),
  }),
  z.object({
    resourceType: z.literal("role"),
    resourceAttribute: z.enum(["iconId", "thumbnailId"]),
    resourceId: z.string().cuid(),
    imageId: z.string().cuid(),
  }),
]);

export async function PATCH(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/upload/assign", "PATCH");
    await authentication.authorizeApi(
      "manufacturersSeriesAndVariants",
      "manage",
    );

    /**
     * Validate the request params and body
     */
    const body: unknown = await request.json();
    const data = bodySchema.parse(body);

    /**
     * Make sure the item exists.
     */
    if (data.resourceType === "manufacturer") {
      await authentication.authorizeApi(
        "manufacturersSeriesAndVariants",
        "manage",
      );

      const existingItem = await prisma.manufacturer.findUnique({
        where: {
          id: data.resourceId,
        },
      });
      if (!existingItem) throw new Error("Not found");

      /**
       * Update
       */
      await prisma.manufacturer.update({
        where: {
          id: existingItem.id,
        },
        data: {
          [data.resourceAttribute]: data.imageId,
        },
      });
    } else if (data.resourceType === "role") {
      await authentication.authorizeApi("role", "manage");

      const existingItem = await prisma.role.findUnique({
        where: {
          id: data.resourceId,
        },
      });
      if (!existingItem) throw new Error("Not found");

      /**
       * Update
       */
      await prisma.role.update({
        where: {
          id: existingItem.id,
        },
        data: {
          [data.resourceAttribute]: data.imageId,
        },
      });
    }

    /**
     * Respond with the result
     */
    return NextResponse.json({});
  } catch (error) {
    return apiErrorHandler(error);
  }
}
