import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | Sinister Incorporated",
};

export default function Page() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <main className="w-full max-w-md py-8">
        <h1>Impressum</h1>

        <p className="italic">work in progress</p>
      </main>
    </div>
  );
}
