import Button from "@/common/components/Button";
import type { getEvent } from "@/discord/getEvent";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import Link from "next/link";
import { LuCalendarArrowDown } from "react-icons/lu";
import { getGoogleCalendarUrl } from "../utils/getGoogleCalendarUrl";
import { getOutlookUrl } from "../utils/getOutlookUrl";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

export const DownloadEventButton = ({ className, event }: Props) => {
  const googleCalendarUrl = getGoogleCalendarUrl(event);
  const microsoftOutlookUrl = getOutlookUrl(event);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" className={clsx(className)}>
          <LuCalendarArrowDown />
          Zum eigenen Kalender hinzufügen
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-neutral-800 rounded py-2"
          side="top"
          sideOffset={4}
        >
          <DropdownMenu.Item asChild>
            <Link
              href={googleCalendarUrl}
              className="text-sinister-red-500 hover:underline block px-3 py-1"
            >
              Google Calender
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href={microsoftOutlookUrl}
              className="text-sinister-red-500 hover:underline block px-3 py-1"
            >
              Microsoft Outlook
            </Link>
          </DropdownMenu.Item>

          {/* TODO: Implement ics file generation and download */}
          {/* <DropdownMenu.Item asChild>
            <Link
              href=""
              className="text-sinister-red-500 hover:underline block px-3 py-1"
            >
              Als ICS-Datei herunterladen
            </Link>
          </DropdownMenu.Item> */}

          <DropdownMenu.Arrow className="fill-neutral-800" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
