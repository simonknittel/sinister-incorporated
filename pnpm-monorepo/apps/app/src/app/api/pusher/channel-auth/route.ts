import {
  getApplicationContext,
  isApplicationError,
  mapApplicationErrorToRouteResponse,
  toActor,
} from "@/modules/application";
import { requireAuthenticationApi } from "@/modules/auth/server";
import apiErrorHandler from "@/modules/common/utils/apiErrorHandler";
import { log } from "@/modules/logging";
import { channelsClient } from "@/modules/pusher/utils/channelsClient";
import {
  authorizeRealtimeChannel,
  authorizeRealtimeChannelInputSchema,
} from "@sam-monorepo/application";
import { NextResponse } from "next/server";
import * as z from "zod";

const postBodySchema = z.object({
  socket_id: z.string(),
  channel_name: z.string(),
});

export async function POST(request: Request) {
  try {
    const authentication = await requireAuthenticationApi(
      "/api/pusher/channel-auth",
      "POST",
    );

    const body = await request.formData();
    const data = postBodySchema.parse({
      socket_id: body.get("socket_id"),
      channel_name: body.get("channel_name"),
    });
    const input = authorizeRealtimeChannelInputSchema.parse({
      channel_name: data.channel_name,
    });

    if (!channelsClient) {
      log.warn("[Pusher] Channels client not initialized.");
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    await authorizeRealtimeChannel(
      getApplicationContext(),
      await toActor(authentication.session),
      input,
    );

    return NextResponse.json(
      channelsClient.authorizeChannel(data.socket_id, input.channel_name),
    );
  } catch (error) {
    return isApplicationError(error)
      ? mapApplicationErrorToRouteResponse(error)
      : apiErrorHandler(error);
  }
}
