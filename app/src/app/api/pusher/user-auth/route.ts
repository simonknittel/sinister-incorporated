import { authenticateApi } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { log } from "@/logging";
import { channelsClient } from "@/pusher/utils/channelsClient";
import { NextResponse } from "next/server";
import { z } from "zod";

const postBodySchema = z.object({
  socket_id: z.string(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateApi(
      "/api/pusher/user-auth",
      "POST",
    );

    /**
     * Validate the request body
     */
    const body = await request.formData();
    const data = postBodySchema.parse({
      socket_id: body.get("socket_id"),
    });

    /**
     * Do the thing
     */
    if (!channelsClient) {
      void log.warn("[Pusher] Channels client not initialized.");
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    const authResponse = channelsClient.authenticateUser(data.socket_id, {
      id: authentication.session.user.id,
    });

    /**
     * Respond with the result
     */
    return NextResponse.json(authResponse);
  } catch (error) {
    /**
     * Respond with an error
     */
    return apiErrorHandler(error);
  }
}
