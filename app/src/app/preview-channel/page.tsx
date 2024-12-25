import { CurrentStatusLoader } from "@/common/components/preview-channel/CurrentStatusLoader";
import { FullScheduleLoader } from "@/common/components/preview-channel/FullScheduleLoader";
import { schedule } from "@/common/components/preview-channel/_lib/schedule";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Preview Channel | S.A.M. - Sinister Incorporated",
};

export default function Page() {
  return (
    <main className="p-2 pt-4 lg:p-8 flex items-center flex-col">
      <h1 className="text-xl font-bold">Preview Channel</h1>

      <CurrentStatusLoader schedule={schedule} />

      <FullScheduleLoader schedule={schedule} />
    </main>
  );
}
