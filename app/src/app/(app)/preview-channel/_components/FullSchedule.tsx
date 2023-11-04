"use client";

import clsx from "clsx";
import { getNow } from "../_lib/getNow";
import { useSchedule } from "../_lib/useSchedule";
import { type Schedule } from "../page";

interface Props {
  schedule: Schedule;
}

const FullSchedule = ({ schedule }: Readonly<Props>) => {
  const { currentlyLive } = useSchedule(schedule);

  return (
    <section className="mt-4 max-w-4xl p-4 lg:p-8 rounded bg-neutral-900">
      <h2 className="font-bold text-xl mb-4">Full schedule</h2>

      <ul>
        {schedule.map((time) => (
          <li
            key={time.start.toISOString()}
            className={clsx({
              "text-neutral-500": time.end < getNow(),
              "text-green-500": time === currentlyLive,
            })}
          >
            {time.start.toLocaleDateString()} {time.start.toLocaleTimeString()}{" "}
            - {time.end.toLocaleDateString()} {time.end.toLocaleTimeString()}{" "}
            (region: {time.region})
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FullSchedule;
