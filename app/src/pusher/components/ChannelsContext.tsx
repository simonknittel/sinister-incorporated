"use client";

import { env } from "@/env";
import type { User } from "@prisma/client";
import Pusher from "pusher-js";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef } from "react";

const ChannelsContext = createContext(undefined);

interface Props {
  readonly children: ReactNode;
  readonly userId: User["id"];
}

export const ChannelsProvider = ({ children, userId }: Props) => {
  const clientRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (
      !env.NEXT_PUBLIC_PUSHER_CHANNELS_APP_ID ||
      !env.NEXT_PUBLIC_PUSHER_CHANNELS_APP_KEY
    ) {
      console.info(
        "[Pusher] Channels client not initialized, missing environment variables.",
      );
      return;
    }

    clientRef.current = new Pusher(env.NEXT_PUBLIC_PUSHER_CHANNELS_APP_KEY, {
      cluster: "eu",
      wsHost: env.NEXT_PUBLIC_PUSHER_CHANNELS_HOST,
      wsPort: env.NEXT_PUBLIC_PUSHER_CHANNELS_PORT,
      wssPort: env.NEXT_PUBLIC_PUSHER_CHANNELS_SECURE_PORT,
      httpHost: env.NEXT_PUBLIC_PUSHER_CHANNELS_HOST,
      httpPort: env.NEXT_PUBLIC_PUSHER_CHANNELS_PORT,
      httpsPort: env.NEXT_PUBLIC_PUSHER_CHANNELS_SECURE_PORT,
      forceTLS: env.NEXT_PUBLIC_PUSHER_CHANNELS_SECURE_PORT ? true : false,
    });
    console.info("[Pusher] Channels client initialized.");

    const channel = clientRef.current.subscribe("debug-channel");
    channel.bind("debug-event", (data: unknown) => {
      console.log("[Pusher] Debug event received:", data);
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
        console.info("[Pusher] Client disconnected.");
      }
    };
  }, [userId]);

  return (
    <ChannelsContext.Provider value={undefined}>
      {children}
    </ChannelsContext.Provider>
  );
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useChannelsContext() {
  const context = useContext(ChannelsContext);
  if (!context) throw new Error("Provider missing!");
  return context;
}
