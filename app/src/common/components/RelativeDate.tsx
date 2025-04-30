"use client";

import { useFormatter, useNow } from "next-intl";

interface Props {
  readonly date: Date | string;
}

export const RelativeDate = ({ date }: Props) => {
  const now = useNow({
    updateInterval: 60_000,
  });
  const format = useFormatter();

  return format.relativeTime(new Date(date), now);
};
