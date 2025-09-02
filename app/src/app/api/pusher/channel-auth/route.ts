import { requireAuthenticationApi } from "@/auth/server";
import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { log } from "@/logging";
import { channelsClient } from "@/pusher/utils/channelsClient";
import { NextResponse } from "next/server";
import { z } from "zod";

const postBodySchema = z.object({
  socket_id: z.string(),
  channel_name: z.string(),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await requireAuthenticationApi(
      "/api/pusher/user-auth",
      "POST",
    );

    /**
     * Validate the request body
     */
    const body = await request.formData();
    const data = postBodySchema.parse({
      socket_id: body.get("socket_id"),
      channel_name: body.get("channel_name"),
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

    if (data.channel_name.startsWith("private-event-")) {
      await authentication.authorizeApi("event", "read");
      const authResponse = channelsClient.authorizeChannel(
        data.socket_id,
        data.channel_name,
      );
      return NextResponse.json(authResponse);
    }

    return NextResponse.json(
      { error: "Invalid channel name" },
      { status: 400 },
    );
  } catch (error) {
    /**
     * Respond with an error
     */
    return apiErrorHandler(error);
  }
}
