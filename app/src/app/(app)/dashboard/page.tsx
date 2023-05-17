import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Sinister Incorporated",
};

export default function Page() {
  return (
    <main className="p-4 lg:p-8 pt-20">
      <h1 className="text-xl font-bold">Dashboard</h1>
    </main>
  );
}
