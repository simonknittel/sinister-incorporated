import { type Metadata } from "next";
import { Footer } from "../_components/Footer";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Sinister Incorporated",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-sinister-radial-gradient">
      <div className="p-2 pt-4 lg:p-8">
        <main className="flex items-center flex-col">
          <h1 className="text-xl font-bold">Datenschutzerklärung</h1>

          <div className="mt-4 w-full max-w-xl p-4 lg:p-8 rounded-2xl bg-neutral-900/50 backdrop-blur">
            <p className="italic">work in progress</p>
          </div>
        </main>

        <Footer className="mt-4" />
      </div>
    </div>
  );
}
