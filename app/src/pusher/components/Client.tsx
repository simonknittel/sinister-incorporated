"use client";

import type { User } from "@prisma/client";
import * as PusherPushNotifications from "@pusher/push-notifications-web";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useBeamsContext } from "./BeamsContext";

interface Props {
  readonly instanceId: string;
  readonly userId: User["id"];
}

export const Client = ({ instanceId, userId }: Props) => {
  const { interests } = useBeamsContext();

  useEffect(() => {
    if (interests === undefined) return;

    let beamsClient: PusherPushNotifications.Client;

    try {
      beamsClient = new PusherPushNotifications.Client({
        instanceId,
      });

      if (interests.length <= 0) {
        void beamsClient.stop();
        console.info("[Pusher] Client stopped.");
        return;
      }

      void beamsClient
        .start()
        .then(() => {
          const _interests = [...interests, `debug-user-${userId}`];
          console.info(
            "[Pusher] Client started. Settings interests...",
            _interests,
          );
          return beamsClient.setDeviceInterests(_interests);
        })
        .then(() => {
          console.info("[Pusher] Device interests set.");
        });
    } catch (error) {
      console.error("[Pusher] Error initializing client.", error);
      toast.error("Benachrichtigungen konnten nicht aktiviert werden.");
    }
  }, [interests, instanceId, userId]);

  return null;
};
