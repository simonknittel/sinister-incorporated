"use client";

import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import { Countdown } from "./Countdown";
import { type Schedule } from "./_lib/schedule";
import { useSchedule } from "./_lib/useSchedule";

interface Props {
  schedule: Schedule;
}

const CurrentStatus = ({ schedule }: Readonly<Props>) => {
  const { currentlyLive, nextLive } = useSchedule(schedule);

  return (
    <section className="mt-4 w-full max-w-xl p-4 lg:p-8 rounded bg-neutral-900">
      <h2 className="font-bold text-xl mb-4">Current status</h2>

      <div className="flex items-baseline gap-2">
        {currentlyLive ? (
          <>
            <FaRegCheckCircle className="text-green-500 relative top-[2px]" />

            <div>
              <p>
                The preview channel is currently active (region:{" "}
                {currentlyLive.region}).
              </p>

              <p>
                Closes in <Countdown date={currentlyLive.end} />
              </p>

              {nextLive ? (
                <p>
                  Re-opens in <Countdown date={nextLive.start} /> (region:{" "}
                  {nextLive.region})
                </p>
              ) : (
                <p>No further schedule known.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <FaRegTimesCircle className="text-red-500 relative top-[2px]" />

            <div>
              <p>The preview channel is currently not active.</p>

              {nextLive ? (
                <p>
                  Opens in{" "}
                  <span className="font-bold">
                    <Countdown date={nextLive.start} />
                  </span>{" "}
                  (region: <span className="font-bold">{nextLive.region}</span>)
                </p>
              ) : (
                <p>No further schedule known.</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CurrentStatus;
