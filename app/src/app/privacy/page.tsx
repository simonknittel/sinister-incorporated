import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Sinister Incorporated",
};

export default function Page() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <main className="w-full max-w-md py-8">
        <h1>Datenschutzerklärung</h1>

        <p className="italic">work in progress</p>
      </main>
    </div>
  );
}
