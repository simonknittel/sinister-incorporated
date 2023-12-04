import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Sinister Incorporated",
};

export default function Page() {
  return (
    <main className="p-2 pt-4 lg:p-8 flex items-center flex-col">
      <h1 className="text-xl font-bold">Datenschutzerklärung</h1>

      <div className="mt-4 w-full max-w-xl p-4 lg:p-8 rounded bg-neutral-900">
        <p className="italic">work in progress</p>
      </div>
    </main>
  );
}
