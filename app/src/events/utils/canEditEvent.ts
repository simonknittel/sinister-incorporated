import type { Event } from "@prisma/client";

export const canEditEvent = (event: Event) => {
  const now = new Date();

  if (!event.endTime) {
    const endTime = new Date(event.startTime);
    endTime.setHours(endTime.getHours() + 4);
    return endTime > now;
  }

  return event.endTime > now;
};
