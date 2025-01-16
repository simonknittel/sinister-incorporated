"use client";

import type { DiscordEventSubscriber } from "@prisma/client";
import * as PusherPushNotifications from "@pusher/push-notifications-web";
import toast from "react-hot-toast";

type Props = Readonly<{
  instanceId: string;
  discordEventSubscriber: DiscordEventSubscriber;
}>;

export const Client = ({ instanceId, discordEventSubscriber }: Props) => {
  return (
    <div
      ref={() => {
        let beamsClient: PusherPushNotifications.Client;

        try {
          beamsClient = new PusherPushNotifications.Client({
            instanceId,
          });

          void beamsClient.start().then(() => {
            return beamsClient.setDeviceInterests([
              ...(discordEventSubscriber.newEvent ? ["newDiscordEvent"] : []),
              ...(discordEventSubscriber.updatedEvent
                ? ["updatedDiscordEvent"]
                : []),
            ]);
          });
        } catch (error) {
          console.error(error);
          toast.error("Benachrichtigungen konnten nicht aktiviert werden.");
        }

        return () => {
          void beamsClient.stop();
        };
      }}
    />
  );
};
