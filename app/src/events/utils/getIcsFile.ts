import type { getEvent } from "@/discord/utils/getEvent";
import { format } from "date-fns";
import { createEvent, type DateTime } from "ics";

export const getIcsFile = (
  event: Awaited<ReturnType<typeof getEvent>>["data"],
) => {
  const start = format(event.scheduled_start_time, "yyyy-MM-dd-HH-mm")
    .split("-")
    .map(Number) as DateTime;
  const endDate = new Date(
    event.scheduled_end_time || event.scheduled_start_time,
  );
  const end = format(endDate, "yyyy-MM-dd-HH-mm")
    .split("-")
    .map(Number) as DateTime;

  const { error, value } = createEvent({
    title: event.name,
    start,
    end,
    ...(event.description && { description: event.description }),
    ...(event.entity_metadata.location && {
      location: event.entity_metadata.location,
    }),
  });
  if (error) throw error;
  if (!value) throw new Error("No value returned from createEvent");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(value)}`;
};
