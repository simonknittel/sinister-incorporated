"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "../../server/db";
import { authenticateAction } from "../auth/server";
import serverActionErrorHandler from "./serverActionErrorHandler";
import { type ServerAction } from "./types";

/**
 * Make sure this file matches `/src/app/api/manufacturer/[id]`.
 */

const updatePayloadSchema = z.object({
  id: z.string().cuid2(),
  name: z.string().trim().min(1).optional(),
  imageId: z.string().trim().min(1).max(255).optional(),
});

export const updateManufacturer: ServerAction<
  z.infer<typeof updatePayloadSchema>
> = async (payload) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateManufacturer");
    authentication.authorizeAction("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request
     */
    const { id, ...data } = updatePayloadSchema.parse(payload);

    /**
     * Make sure the item exists
     */
    const existingItem = await prisma.manufacturer.findUnique({
      where: {
        id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.manufacturer.update({
      where: {
        id,
      },
      data,
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("manufacturer");
    revalidateTag(`manufacturer:${updatedItem.id}`);

    /**
     * Respond with the result
     */
    return {
      status: 200,
    };
  } catch (error) {
    return serverActionErrorHandler(error);
  }
};

const deletePayloadSchema = z.object({
  id: z.string().cuid2(),
});

export const deleteManufacturer: ServerAction<
  z.infer<typeof deletePayloadSchema>
> = async (payload) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteManufacturer");
    authentication.authorizeAction("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request
     */
    const { id } = deletePayloadSchema.parse(payload);

    /**
     * Make sure the item exists
     */
    const existingItem = await prisma.manufacturer.findUnique({
      where: {
        id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Delete
     */
    await prisma.manufacturer.delete({
      where: {
        id,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("manufacturer");
    revalidateTag(`manufacturer:${id}`);

    /**
     * Respond with the result
     */
    return {
      status: 200,
    };
  } catch (error) {
    return serverActionErrorHandler(error);
  }
};
