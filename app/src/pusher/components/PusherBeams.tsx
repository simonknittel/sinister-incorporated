import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import { env } from "@/env";
import { getMyDiscordEventSubscriber } from "@/events/queries";
import { ClientLoader } from "./ClientLoader";

export const PusherBeams = async () => {
  const enableNotifications = await getUnleashFlag("EnableNotifications");
  if (!enableNotifications) return null;

  if (!env.PUSHER_BEAMS_INSTANCE_ID) return null;

  const discordEventSubscriber = await getMyDiscordEventSubscriber();
  if (!discordEventSubscriber) return null;

  if (!discordEventSubscriber.newEvent && !discordEventSubscriber.updatedEvent)
    return null;

  return (
    <ClientLoader
      instanceId={env.PUSHER_BEAMS_INSTANCE_ID}
      discordEventSubscriber={discordEventSubscriber}
    />
  );
};
