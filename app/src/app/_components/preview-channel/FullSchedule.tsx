"use client";

import clsx from "clsx";
import { getNow } from "./_lib/getNow";
import { type Schedule } from "./_lib/schedule";
import { useSchedule } from "./_lib/useSchedule";

interface Props {
  schedule: Schedule;
}

const FullSchedule = ({ schedule }: Readonly<Props>) => {
  const { currentlyLive } = useSchedule(schedule);

  return (
    <section className="mt-4 w-full max-w-xl p-4 lg:p-8 rounded bg-neutral-900">
      <h2 className="font-bold text-xl mb-4">Full schedule</h2>

      <ul className="flex flex-col gap-2 list-disc pl-5">
        {schedule.map((time) => (
          <li
            key={time.start.toISOString()}
            className={clsx({
              "text-neutral-500": time.end < getNow(),
              "text-green-500": time === currentlyLive,
            })}
          >
            {time.start.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            {time.start.toLocaleTimeString(undefined, {
              timeStyle: "short",
            })}{" "}
            -{" "}
            {time.end.toLocaleDateString(undefined, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            {time.end.toLocaleTimeString(undefined, {
              timeStyle: "short",
            })}{" "}
            (region: {time.region})
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FullSchedule;
