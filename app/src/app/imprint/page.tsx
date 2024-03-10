import { type Metadata } from "next";
import { Footer } from "../_components/Footer";
import { Wip } from "../_components/Wip";

export const metadata: Metadata = {
  title: "Impressum | Sinister Incorporated",
};

export default function Page() {
  return (
    <div className="min-h-dvh bg-sinister-radial-gradient">
      <div className="p-2 pt-4 lg:p-8">
        <main className="flex items-center flex-col">
          <h1 className="text-xl font-bold">Impressum</h1>

          <div className="mt-4 w-full max-w-xl p-4 lg:p-8 rounded-2xl bg-neutral-800/50 backdrop-blur">
            <Wip />
          </div>
        </main>

        <Footer className="mt-4" />
      </div>
    </div>
  );
}
