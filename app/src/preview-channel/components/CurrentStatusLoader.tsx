"use client";

import dynamic from "next/dynamic";
import type { Schedule } from "../utils/schedule";
import { TileSkeleton } from "./TileSkeleton";

const CurrentStatus = dynamic(
  () => import("@/common/components/preview-channel/CurrentStatus"),
  {
    ssr: false,
    loading: () => <TileSkeleton className="mt-4" />,
  },
);

type Props = Readonly<{
  schedule: Schedule;
}>;

export const CurrentStatusLoader = ({ schedule }: Props) => {
  return <CurrentStatus schedule={schedule} />;
};
