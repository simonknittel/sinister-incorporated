"use client";

import clsx from "clsx";
import Link from "next/link";
import { getNow } from "../utils/getNow";
import type { Schedule } from "../utils/schedule";
import { useSchedule } from "../utils/useSchedule";

interface Props {
  schedule: Schedule;
}

const FullSchedule = ({ schedule }: Readonly<Props>) => {
  const { currentlyLive } = useSchedule(schedule);

  return (
    <section className="mt-4 w-full max-w-xl p-4 lg:p-8 rounded-2xl bg-neutral-800/50 ">
      <h2 className="font-bold text-xl mb-4">Full schedule</h2>

      <ul className="flex flex-col gap-2 list-disc pl-5">
        {schedule.map((time) => (
          <li
            key={time.start.toISOString()}
            className={clsx({
              "text-neutral-500": time.end < getNow(),
              "text-green-500 font-bold": time === currentlyLive,
            })}
          >
            {time.start.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: "Europe/Berlin",
            })}{" "}
            {time.start.toLocaleTimeString(undefined, {
              timeStyle: "short",
              timeZone: "Europe/Berlin",
            })}{" "}
            -{" "}
            {time.end.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: "Europe/Berlin",
            })}{" "}
            {time.end.toLocaleTimeString(undefined, {
              timeStyle: "short",
              timeZone: "Europe/Berlin",
            })}{" "}
            (region: {time.region})
          </li>
        ))}
      </ul>

      <p className="mt-4">
        Source:{" "}
        <Link
          href="https://robertsspaceindustries.com/spectrum/community/SC/forum/1/thread/pyro-preview-channel-update"
          className="inline-flex items-center justify-center rounded gap-2 text-sinister-red-500 hover:bg-sinisterborder-sinister-red-300 hover:text-sinister-red-300 active:text-sinister-red-300 underline"
        >
          Spectrum
        </Link>
      </p>
    </section>
  );
};

export default FullSchedule;
