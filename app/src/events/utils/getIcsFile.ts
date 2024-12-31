import type { getEvent } from "@/discord/getEvent";
import { formatInTimeZone } from "date-fns-tz";
import { createEvent, type DateTime } from "ics";

export const getIcsFile = (
  event: Awaited<ReturnType<typeof getEvent>>["data"],
) => {
  const start = formatInTimeZone(
    event.scheduled_start_time,
    "Europe/Berlin",
    "yyyy-MM-dd-HH-mm",
  )
    .split("-")
    .map(Number) as DateTime;
  const end = formatInTimeZone(
    event.scheduled_end_time,
    "Europe/Berlin",
    "yyyy-MM-dd-HH-mm",
  )
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
