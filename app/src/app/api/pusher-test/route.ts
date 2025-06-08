import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { log } from "@/logging";
import { channelsClient } from "@/pusher/utils/channelsClient";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!channelsClient) {
      void log.warn("[Pusher] Channels client not initialized.");
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    await channelsClient.trigger("debug-channel", "debug-event", {
      message: "Hello, world!",
    });

    return NextResponse.json({ success: "ok" });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
