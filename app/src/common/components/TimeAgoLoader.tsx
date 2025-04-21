"use client";

import dynamic from "next/dynamic";

const TimeAgoContainer = dynamic(
  () => import("@/common/components/TimeAgoContainer"),
  {
    ssr: false,
    loading: () => (
      <span className="block h-[1em] w-[7em] animate-pulse rounded bg-neutral-500" />
    ),
  },
);

interface Props {
  readonly date: Date | string;
}

export const TimeAgoLoader = ({ date }: Props) => {
  return <TimeAgoContainer date={date} />;
};
