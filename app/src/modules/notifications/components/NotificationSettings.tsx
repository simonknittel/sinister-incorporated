"use client";

import { useAuthentication } from "@/modules/auth/hooks/useAuthentication";
import { Button2 } from "@/modules/common/components/Button2";
import YesNoCheckbox from "@/modules/common/components/form/YesNoCheckbox";
import { Tile } from "@/modules/common/components/Tile";
import { useBeamsContext } from "@/modules/pusher/components/BeamsContext";
import clsx from "clsx";
import { useEffect, useMemo, useState, type FormEventHandler } from "react";
import toast from "react-hot-toast";
import {
  FaDesktop,
  FaDiscord,
  FaEnvelope,
  FaInfoCircle,
  FaMobile,
} from "react-icons/fa";

interface Props {
  readonly className?: string;
}

export const NotificationSettings = ({ className }: Props) => {
  const authentication = useAuthentication();
  if (!authentication || !authentication.session.entity)
    throw new Error("Unauthorized");

  const { setInterests } = useBeamsContext();

  const taskAssignedInterest = useMemo(() => {
    return `task_assigned;citizen_id=${authentication.session.entity!.id}`;
  }, [authentication]);

  const notifications = useMemo(
    () => [
      {
        appTitle: "Events",
        notifications: [
          {
            id: "event_created",
            pusherId: "newDiscordEvent",
            title: "Neues Event",
          },
          {
            id: "event_updated",
            pusherId: "updatedDiscordEvent",
            title: "Aktualisierung",
            description:
              "Bei Änderung des Titel, der Beschreibung, des Datums und des Ortes",
          },
          {
            id: "event_deleted",
            pusherId: "deletedDiscordEvent",
            title: "Absagen",
          },
        ],
      },

      {
        appTitle: "Tasks",
        notifications: [
          {
            id: "task_assigned",
            pusherId: taskAssignedInterest,
            title: "Zuweisung",
            description: "Wenn mir ein Task zugewiesen wird",
          },
        ],
      },
    ],
    [taskAssignedInterest],
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setInterests((currentValue) => {
      if (currentValue === undefined) return currentValue;

      const newValue = currentValue.filter(
        (interest) =>
          [
            "newDiscordEvent",
            "updatedDiscordEvent",
            "deletedDiscordEvent",
            taskAssignedInterest,
          ].includes(interest) === false,
      );

      if (formData.get("pusher_event_created") === "true")
        newValue.push("newDiscordEvent");
      if (formData.get("pusher_event_updated") === "true")
        newValue.push("updatedDiscordEvent");
      if (formData.get("pusher_event_deleted") === "true")
        newValue.push("deletedDiscordEvent");
      if (formData.get("pusher_task_assigned") === "true")
        newValue.push(taskAssignedInterest);

      return newValue;
    });

    toast.success("Erfolgreich gespeichert");
  };

  return (
    <Tile heading="Einstellungen" className={clsx(className)}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2 text-neutral-500">
          <div className="flex-1" />

          <div className="flex-none w-16 flex flex-col justify-center items-center text-center">
            <span className="flex-1 w-full flex justify-center items-center gap-1">
              <FaInfoCircle />
            </span>

            <p className="w-full text-sm">On-site</p>
          </div>

          <div className="flex-none w-16 flex flex-col justify-center items-center text-center">
            <span className="flex-1 w-full flex justify-center items-center gap-1">
              <FaDiscord />
            </span>

            <p className="w-full text-sm">Discord</p>
          </div>

          <div className="flex-none w-16 flex flex-col justify-center items-center text-center">
            <span className="flex-1 w-full flex justify-center items-center gap-1">
              <FaMobile /> / <FaDesktop />
            </span>

            <p className="w-full text-sm">Browser</p>
          </div>

          <div className="flex-none w-16 flex flex-col justify-center items-center text-center">
            <span className="flex-1 w-full flex justify-center items-center gap-1">
              <FaEnvelope />
            </span>

            <p className="w-full text-sm">E-Mail</p>
          </div>
        </div>

        {notifications.map((app) => (
          <AppSettings
            key={app.appTitle}
            title={app.appTitle}
            notifications={app.notifications}
          />
        ))}

        <div className="flex justify-end">
          <Button2 type="submit">Speichern</Button2>
        </div>
      </form>
    </Tile>
  );
};

interface AppSettingsProp {
  readonly title: string;
  readonly notifications: SingleNotificationSettingsProps[];
}

const AppSettings = ({ title, notifications }: AppSettingsProp) => {
  return (
    <article>
      <h2 className="text-xl font-bold border-b border-white/5 pb-2">
        {title}
      </h2>

      <div className="flex flex-col gap-2 mt-4">
        {notifications.map((notification) => (
          <SingleNotificationSettings key={notification.id} {...notification} />
        ))}
      </div>
    </article>
  );
};

interface SingleNotificationSettingsProps {
  readonly id: string;
  readonly pusherId: string;
  readonly title: string;
  readonly description?: string;
}

const SingleNotificationSettings = ({
  id,
  pusherId,
  title,
  description,
}: SingleNotificationSettingsProps) => {
  const [isOnSiteEnabled, setIsOnSiteEnabled] = useState(false);

  const [isDiscordEnabled, setIsDiscordEnabled] = useState(false);

  const { interests } = useBeamsContext();
  const [isPusherEnabled, setIsPusherEnabled] = useState(
    interests?.includes(pusherId) || false,
  );
  useEffect(() => {
    setIsPusherEnabled(interests?.includes(pusherId) || false);
  }, [interests, pusherId]);

  const [isEmailEnabled, setIsEmailEnabled] = useState(false);

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <h3>{title}</h3>

        <p className="text-sm text-neutral-500">{description || <>&nbsp;</>}</p>
      </div>

      <div className="flex-none w-16 flex justify-center items-center">
        <YesNoCheckbox
          name={`onsite_${id}`}
          hideLabel
          checked={isOnSiteEnabled}
          onChange={(event) => setIsOnSiteEnabled(event.target.checked)}
          value="true"
          disabled
        />
      </div>

      <div className="flex-none w-16 flex justify-center items-center">
        <YesNoCheckbox
          name={`discord_${id}`}
          hideLabel
          checked={isDiscordEnabled}
          onChange={(event) => setIsDiscordEnabled(event.target.checked)}
          value="true"
          disabled
        />
      </div>

      <div className="flex-none w-16 flex justify-center items-center">
        <YesNoCheckbox
          name={`pusher_${id}`}
          hideLabel
          checked={isPusherEnabled}
          onChange={(event) => setIsPusherEnabled(event.target.checked)}
          value="true"
        />
      </div>

      <div className="flex-none w-16 flex justify-center items-center">
        <YesNoCheckbox
          name={`email_${id}`}
          hideLabel
          checked={isEmailEnabled}
          onChange={(event) => setIsEmailEnabled(event.target.checked)}
          value="true"
          disabled
        />
      </div>
    </div>
  );
};
