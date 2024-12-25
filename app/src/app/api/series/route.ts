import { authenticateApi } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const postBodySchema = z.object({
  name: z.string().trim().min(1),
  manufacturerId: z.string(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi("/api/series", "POST");
    await authentication.authorizeApi(
      "manufacturersSeriesAndVariants",
      "manage",
    );

    /**
     * Validate the request body
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Create
     */
    const createdItem = await prisma.series.create({
      data: {
        name: data.name,
        manufacturer: {
          connect: {
            id: data.manufacturerId,
          },
        },
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag(`series:${createdItem.id}`);
    revalidateTag(`manufacturer:${createdItem.manufacturerId}`);
    revalidateTag(`manufacturer`);

    return NextResponse.json(createdItem);
  } catch (error) {
    return apiErrorHandler(error);
  }
}
