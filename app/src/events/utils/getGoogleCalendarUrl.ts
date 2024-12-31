import type { getEvent } from "@/discord/getEvent";
import { format } from "date-fns/format";
import { de } from "date-fns/locale/de";

export const getGoogleCalendarUrl = (
  event: Awaited<ReturnType<typeof getEvent>>["data"],
) => {
  const subject = encodeURIComponent(event.name);

  const start = format(event.scheduled_start_time, "yyyyMMdd'T'HHmmss", {
    locale: de,
  });

  const end = format(event.scheduled_end_time, "yyyyMMdd'T'HHmmss", {
    locale: de,
  });

  const description = event.description
    ? `&details=${encodeURIComponent(event.description)}`
    : "";

  const location = event.entity_metadata.location
    ? `&location=${encodeURIComponent(event.entity_metadata.location)}`
    : "";

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${subject}&dates=${start}/${end}&ctz=Europe/Berlin${description}${location}`;
};
