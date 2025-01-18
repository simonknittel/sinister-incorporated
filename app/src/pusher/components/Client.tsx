"use client";

import * as PusherPushNotifications from "@pusher/push-notifications-web";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useBeamsContext } from "./BeamsContext";

type Props = Readonly<{
  instanceId: string;
}>;

export const Client = ({ instanceId }: Props) => {
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
        console.info("[Pusher] Client stopped");
        return;
      }

      void beamsClient
        .start()
        .then(() => {
          console.info("[Pusher] Client started");
          return beamsClient.setDeviceInterests(interests);
        })
        .then(() => {
          console.info("[Pusher] Device interests set");
        });
    } catch (error) {
      console.error("[Pusher] Error initializing client", error);
      toast.error("Benachrichtigungen konnten nicht aktiviert werden.");
    }
  }, [interests, instanceId]);

  return null;
};
