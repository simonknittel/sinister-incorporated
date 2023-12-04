import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { TileSkeleton } from "~/app/_components/preview-channel/TileSkeleton";
import { schedule } from "~/app/_components/preview-channel/_lib/schedule";

const CurrentStatus = dynamic(
  () => import("~/app/_components/preview-channel/CurrentStatus"),
  {
    ssr: false,
    loading: () => <TileSkeleton className="mt-4" />,
  },
);

const FullSchedule = dynamic(
  () => import("~/app/_components/preview-channel/FullSchedule"),
  {
    ssr: false,
    loading: () => <TileSkeleton className="mt-4" />,
  },
);

export const metadata: Metadata = {
  title: "Preview Channel | Sinister Incorporated",
};

export default function Page() {
  return (
    <main className="p-2 pt-4 lg:p-8 flex items-center flex-col">
      <h1 className="text-xl font-bold">Preview Channel</h1>

      <CurrentStatus schedule={schedule} />

      <FullSchedule schedule={schedule} />
    </main>
  );
}
