"use client";

import Button from "@/common/components/Button";
import { updateMyDiscordEventSubscriber } from "@/events/actions/updateEventNotifications";
import type { DiscordEventSubscriber } from "@prisma/client";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaBell, FaSpinner } from "react-icons/fa";

type Props = Readonly<{
  className?: string;
  discordEventSubscriber?: DiscordEventSubscriber | null;
}>;

export const NotificationsTooltip = ({
  className,
  discordEventSubscriber,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const state = await updateMyDiscordEventSubscriber(formData);

        if (state.error) {
          toast.error(state.error);
          return;
        }

        toast.success(state.success);
      } catch (error) {
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
      }
    });
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="tertiary"
          iconOnly
          className={clsx("!text-xl", className)}
        >
          <FaBell />
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content sideOffset={4}>
          <form
            action={formAction}
            className="px-6 py-4 rounded bg-neutral-800"
          >
            <p>Erhalte ein Benachrichtigung bei ...</p>

            <label className="group flex gap-2 items-center cursor-pointer mt-2">
              <input
                type="checkbox"
                name="newEvent"
                value="true"
                className="hidden peer"
                defaultChecked={discordEventSubscriber?.newEvent}
              />
              <span className="w-8 h-8 bg-neutral-700 rounded block relative peer-checked:hidden">
                <span className="absolute inset-1 rounded bg-green-500/50 hidden group-hover:block" />
              </span>
              <span className="w-8 h-8 bg-neutral-700 rounded hidden relative peer-checked:block">
                <span className="absolute inset-1 rounded bg-green-500" />
              </span>
              neuen Events
            </label>

            <label className="group flex gap-2 items-center cursor-pointer mt-2">
              <input
                type="checkbox"
                name="updatedEvent"
                value="true"
                className="hidden peer"
                defaultChecked={discordEventSubscriber?.updatedEvent}
              />
              <span className="w-8 h-8 bg-neutral-700 rounded block relative peer-checked:hidden">
                <span className="absolute inset-1 rounded bg-green-500/50 hidden group-hover:block" />
              </span>
              <span className="w-8 h-8 bg-neutral-700 rounded hidden relative peer-checked:block">
                <span className="absolute inset-1 rounded bg-green-500" />
              </span>
              Aktualisierungen
            </label>

            <Button type="submit" className="ml-auto mt-2" disabled={isPending}>
              {isPending ? <FaSpinner className="animate-spin" /> : ""}
              Speichern
            </Button>
          </form>

          <Popover.Arrow className="fill-neutral-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
