import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { TileSkeleton } from "./_components/TileSkeleton";

const CurrentStatus = dynamic(() => import("./_components/CurrentStatus"), {
  ssr: false,
  loading: () => <TileSkeleton className="mt-4" />,
});

const FullSchedule = dynamic(() => import("./_components/FullSchedule"), {
  ssr: false,
  loading: () => <TileSkeleton className="mt-4" />,
});

export const metadata: Metadata = {
  title: "Preview Channel | Sinister Incorporated",
};

export type Schedule = Array<{
  start: Date;
  end: Date;
  region: "APAC" | "EU" | "US";
}>;

const schedule: Schedule = [
  {
    start: new Date("2023-10-31T19:00:00.000Z"),
    end: new Date("2023-11-01T03:00:00.000Z"),
    region: "US",
  },
  {
    start: new Date("2023-11-01T13:00:00.000Z"),
    end: new Date("2023-11-01T21:00:00.000Z"),
    region: "EU",
  },
  {
    start: new Date("2023-11-03T06:00:00.000Z"),
    end: new Date("2023-11-03T14:00:00.000Z"),
    region: "APAC",
  },
  {
    start: new Date("2023-11-04T13:00:00.000Z"),
    end: new Date("2023-11-04T21:00:00.000Z"),
    region: "EU",
  },
  {
    start: new Date("2023-11-06T07:00:00.000Z"),
    end: new Date("2023-11-06T15:00:00.000Z"),
    region: "APAC",
  },
  {
    start: new Date("2023-11-06T20:00:00.000Z"),
    end: new Date("2023-11-07T04:00:00.000Z"),
    region: "US",
  },
  {
    start: new Date("2023-11-09T07:00:00.000Z"),
    end: new Date("2023-11-09T15:00:00.000Z"),
    region: "APAC",
  },
  {
    start: new Date("2023-11-09T20:00:00.000Z"),
    end: new Date("2023-11-10T04:00:00.000Z"),
    region: "US",
  },
  {
    start: new Date("2023-11-10T14:00:00.000Z"),
    end: new Date("2023-11-10T22:00:00.000Z"),
    region: "EU",
  },
];

export default function Page() {
  return (
    <main className="p-2 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Preview Channel</h1>

      <CurrentStatus schedule={schedule} />

      <FullSchedule schedule={schedule} />
    </main>
  );
}
