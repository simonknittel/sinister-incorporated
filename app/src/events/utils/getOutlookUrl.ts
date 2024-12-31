import type { getEvent } from "@/discord/getEvent";
import { format } from "date-fns/format";
import { de } from "date-fns/locale/de";

export const getOutlookUrl = (
  event: Awaited<ReturnType<typeof getEvent>>["data"],
) => {
  const subject = encodeURIComponent(event.name);

  const start = format(event.scheduled_start_time, "yyyy-MM-dd'T'HH:mm:ss", {
    locale: de,
  });

  const end = format(event.scheduled_end_time, "yyyy-MM-dd'T'HH:mm:ss", {
    locale: de,
  });

  const description = event.description
    ? `&body=${encodeURIComponent(event.description)}`
    : "";

  const location = event.entity_metadata.location
    ? `&location=${encodeURIComponent(event.entity_metadata.location)}`
    : "";

  return `https://outlook.live.com/calendar/deeplink/compose?subject=${subject}&startdt=${start}&enddt=${end}${description}${location}`;
};
