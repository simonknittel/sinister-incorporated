import { env } from "@/env";
import PushNotifications from "@pusher/push-notifications-server";

export let beamsClient: PushNotifications | null = null;

if (env.PUSHER_BEAMS_INSTANCE_ID && env.PUSHER_BEAMS_KEY) {
  beamsClient = new PushNotifications({
    instanceId: env.PUSHER_BEAMS_INSTANCE_ID,
    secretKey: env.PUSHER_BEAMS_KEY,
  });
}
