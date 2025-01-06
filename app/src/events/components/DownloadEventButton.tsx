import Button from "@/common/components/Button";
import type { getEvent } from "@/discord/utils/getEvent";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import Link from "next/link";
import { FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import { LuCalendarArrowDown } from "react-icons/lu";
import { getGoogleCalendarUrl } from "../utils/getGoogleCalendarUrl";
import { getIcsFile } from "../utils/getIcsFile";
import { getOutlookUrl } from "../utils/getOutlookUrl";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

export const DownloadEventButton = ({ className, event }: Props) => {
  const googleCalendarUrl = getGoogleCalendarUrl(event);
  const microsoftOutlookUrl = getOutlookUrl(event);
  const icsFile = getIcsFile(event);

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
              className="text-sinister-red-500 hover:underline px-3 py-1 flex gap-2 items-center"
            >
              <FaExternalLinkAlt className="text-xs" />
              Google Calender
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href={microsoftOutlookUrl}
              className="text-sinister-red-500 hover:underline px-3 py-1 flex gap-2 items-center"
            >
              <FaExternalLinkAlt className="text-xs" />
              Microsoft Outlook
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href={icsFile}
              className="text-sinister-red-500 hover:underline px-3 py-1 flex gap-2 items-center"
            >
              <FaDownload className="text-xs" />
              ICS-Datei herunterladen
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="fill-neutral-800" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
