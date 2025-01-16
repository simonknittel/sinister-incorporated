"use client";

import type { DiscordEventSubscriber } from "@prisma/client";
import * as PusherPushNotifications from "@pusher/push-notifications-web";

type Props = Readonly<{
  instanceId: string;
  discordEventSubscriber: DiscordEventSubscriber;
}>;

export const Client = ({ instanceId, discordEventSubscriber }: Props) => {
  return (
    <div
      ref={() => {
        const beamsClient = new PusherPushNotifications.Client({
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

        return () => {
          void beamsClient.stop();
        };
      }}
    />
  );
};
