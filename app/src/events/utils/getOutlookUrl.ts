import type { getEvent } from "@/discord/utils/getEvent";
import { formatInTimeZone } from "date-fns-tz";

export const getOutlookUrl = (
  event: Awaited<ReturnType<typeof getEvent>>["data"],
) => {
  const subject = encodeURIComponent(event.name);

  const start = formatInTimeZone(
    event.scheduled_start_time,
    "Europe/Berlin",
    "yyyy-MM-dd'T'HH:mm:ss",
  );

  const endDate = new Date(
    event.scheduled_end_time || event.scheduled_start_time,
  );
  const end = formatInTimeZone(
    endDate,
    "Europe/Berlin",
    "yyyy-MM-dd'T'HH:mm:ss",
  );

  const description = event.description
    ? `&body=${encodeURIComponent(event.description)}`
    : "";

  const location = event.entity_metadata.location
    ? `&location=${encodeURIComponent(event.entity_metadata.location)}`
    : "";

  return `https://outlook.live.com/calendar/deeplink/compose?subject=${subject}&startdt=${start}&enddt=${end}${description}${location}`;
};
