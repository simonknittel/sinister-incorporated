import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Flotte | Sinister Incorporated",
};

export default function Page() {
  return (
    <main>
      <h1 className="font-bold text-xl">Flotte</h1>

      <section className="p-8 bg-neutral-900 rounded max-w-4xl mt-8">
        <h2 className="font-bold text-xl">Meine Schiffe</h2>
      </section>

      <section className="p-8 bg-neutral-900 rounded max-w-4xl mt-8">
        <h2 className="font-bold text-xl">Alle Schiffe</h2>
      </section>
    </main>
  );
}
