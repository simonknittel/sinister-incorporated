import apiErrorHandler from "@/modules/common/utils/apiErrorHandler";
import { type NextRequest } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  message: z.string(),
});

export const POST = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as unknown;
    const data = bodySchema.parse(body);
    throw new Error(data.message);
  } catch (error) {
    return apiErrorHandler(error);
  }
};
