import { authenticateApi } from "@/auth/server";
import { confirmLog } from "@/citizen/utils/confirmLog";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = Promise<{
  id: string;
  logId: string;
}>;

const paramsSchema = z.object({
  id: z.string().cuid(),
  logId: z.string().cuid(),
});

const patchBodySchema = z.object({
  confirmed: z.enum(["confirmed", "false-report"]),
});

export async function PATCH(request: Request, props: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    await authenticateApi(
      "/api/spynet/citizen/[id]/log/[logId]/confirm",
      "PATCH",
    );

    /**
     * Validate the request
     */
    const paramsData = paramsSchema.parse(await props.params);
    const body: unknown = await request.json();
    const data = patchBodySchema.parse(body);
    const entityLog = await prisma.entityLog.findFirst({
      where: {
        id: paramsData.logId,
      },
      include: {
        attributes: true,
      },
    });
    if (!entityLog) throw new Error("Not found");

    /**
     * Confirm the log
     */
    const confirmedAttribute = await confirmLog(entityLog, data.confirmed);

    /**
     * Respond with the result
     */
    return NextResponse.json(confirmedAttribute);
  } catch (error) {
    /**
     * Respond with an error
     */
    return apiErrorHandler(error);
  }
}
