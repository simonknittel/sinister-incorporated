import { authenticateApi } from "@/auth/server";
import { prisma } from "@/db";
import { VariantStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import apiErrorHandler from "../../../lib/apiErrorHandler";

const postBodySchema = z.object({
  name: z.string().trim().min(1),
  seriesId: z.string(),
  status: z
    .enum([VariantStatus.FLIGHT_READY, VariantStatus.NOT_FLIGHT_READY])
    .optional(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/variant", "POST");
    authentication.authorizeApi("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Create
     */
    const createdItem = await prisma.variant.create({
      data,
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("variant");
    revalidateTag(`variant:${createdItem.id}`);
    revalidateTag(`series:${createdItem.seriesId}`);

    return NextResponse.json(createdItem);
  } catch (error) {
    return apiErrorHandler(error);
  }
}
