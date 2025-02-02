import type { getEvent } from "@/discord/utils/getEvent";
import { formatISO } from "date-fns/formatISO";

export const getGoogleCalendarUrl = (
  event: Awaited<ReturnType<typeof getEvent>>["data"],
) => {
  const subject = encodeURIComponent(event.name);

  const start = formatISO(event.scheduled_start_time, { format: "basic" });

  const end = formatISO(event.scheduled_end_time, { format: "basic" });

  const description = event.description
    ? `&details=${encodeURIComponent(event.description)}`
    : "";

  const location = event.entity_metadata.location
    ? `&location=${encodeURIComponent(event.entity_metadata.location)}`
    : "";

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${subject}&dates=${start}/${end}&ctz=UTC${description}${location}`;
};
