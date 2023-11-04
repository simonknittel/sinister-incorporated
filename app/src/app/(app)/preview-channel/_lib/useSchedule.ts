import { useEffect, useState } from "react";
import { type Schedule } from "../page";
import { getNow } from "./getNow";

export const useSchedule = (schedule: Schedule) => {
  const [currentlyLive, setCurrentlyLive] = useState<
    Schedule[number] | undefined
  >(getCurrentlyLive(schedule));

  const [nextLive, setNextLive] = useState<Schedule[number] | undefined>(
    getNextLive(schedule),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentlyLive(getCurrentlyLive(schedule));
      setNextLive(getNextLive(schedule));
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule]);

  return {
    currentlyLive,
    nextLive,
  };
};

function getCurrentlyLive(schedule: Schedule): Schedule[number] | undefined {
  const now = getNow();

  return schedule.find((time) => time.start <= now && now <= time.end);
}

function getNextLive(schedule: Schedule): Schedule[number] | undefined {
  const now = getNow();

  return schedule.find((time) => time.start > now);
}
