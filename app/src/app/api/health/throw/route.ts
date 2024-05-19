import { type NextRequest } from "next/server";
import { z } from "zod";
import apiErrorHandler from "../../../../lib/apiErrorHandler";

const bodySchema = z.object({
  message: z.string(),
});

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const data = bodySchema.parse(body);
    throw new Error(data.message);
  } catch (error) {
    return apiErrorHandler(error);
  }
};
